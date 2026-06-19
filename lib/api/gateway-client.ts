import {
  ApiClientError,
  ApiError,
  ApiUnavailableError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  UnexpectedApiError,
  ValidationError,
  type ApiErrorBody,
} from "@/lib/api/api-errors";
import {
  fallbackApiErrorMessage,
  getUserFriendlyErrorMessage,
} from "@/lib/api/api-error-messages";

type ApiFetchOptions = RequestInit & {
  authenticated?: boolean;
  skipAuthRetry?: boolean;
};

type ApiRequestDebugContext = {
  endpoint: string;
  method: string;
  url: string;
};

const apiEnvName = "NEXT_PUBLIC_API_URL";
const legacyGatewayEnvName = "NEXT_PUBLIC_GATEWAY_URL";
let refreshPromise: Promise<boolean> | null = null;

function shouldLogApiError() {
  return process.env.NODE_ENV === "development";
}

function getApiClientErrorLog(error: ApiClientError) {
  const details =
    typeof error.details === "object" && error.details !== null
      ? (error.details as Record<string, unknown>)
      : undefined;

  return {
    name: error.name,
    message: error.message,
    endpoint: error.endpoint ?? details?.endpoint,
    method: error.method ?? details?.method,
    url: error.url ?? details?.url,
    statusCode: error.statusCode,
    code: error.code,
    requestId: error.requestId,
  };
}

function isExpectedApiError(error: ApiClientError) {
  return (
    error.statusCode === 401 ||
    error.statusCode === 409 ||
    error.statusCode === 422 ||
    error.statusCode === 504
  );
}

function logApiError(error: unknown) {
  if (shouldLogApiError()) {
    if (error instanceof ApiClientError) {
      const payload = getApiClientErrorLog(error);

      if (isExpectedApiError(error)) {
        console.warn("[apiFetch]", payload);
        return;
      }

      console.error("[apiFetch]", payload);
      return;
    }

    console.error("[apiFetch]", error);
  }
}

export function getApiUrl() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_GATEWAY_URL;

  if (!apiUrl) {
    throw new ApiClientError(
      `${apiEnvName} nao foi configurada. Configure ${apiEnvName}=http://localhost:8080.`,
      {
        code: "CONFIG_ERROR",
        details: { expectedEnv: apiEnvName, legacyEnv: legacyGatewayEnvName },
      },
    );
  }

  return apiUrl.replace(/\/$/, "");
}

export const apiUrl = getApiUrl();
export const gatewayUrl = apiUrl;

function hasBody(options: RequestInit) {
  return typeof options.body !== "undefined" && options.body !== null;
}

function isFormDataBody(body: BodyInit | null | undefined) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function createHeaders(options: RequestInit) {
  const headers = new Headers(options.headers);

  if (
    hasBody(options) &&
    !isFormDataBody(options.body) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

function isExpectedUnauthenticatedResponse(
  response: Response,
  context?: ApiRequestDebugContext,
) {
  return (
    response.status === 401 &&
    (context?.endpoint === "/api/auth/me" ||
      context?.endpoint === "/api/auth/refresh")
  );
}

function isApiErrorBody(payload: unknown): payload is ApiErrorBody {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const record = payload as Record<string, unknown>;

  return (
    (typeof record.statusCode === "number" ||
      typeof record.statusCode === "undefined") &&
    (typeof record.code === "string" || typeof record.code === "undefined") &&
    (typeof record.errorCode === "string" ||
      typeof record.errorCode === "undefined") &&
    (typeof record.message === "string" ||
      typeof record.message === "undefined") &&
    (typeof record.requestId === "string" ||
      typeof record.requestId === "undefined")
  );
}

function isJsonResponse(response: Response) {
  return response.headers.get("content-type")?.includes("application/json");
}

async function parseResponseBody(
  response: Response,
  context?: ApiRequestDebugContext,
): Promise<unknown> {
  if (!isJsonResponse(response)) {
    return undefined;
  }

  const text = await response.text();

  if (!text.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new ApiClientError({
      message: "Resposta invalida do servidor.",
      statusCode: response.status,
      code: "INVALID_JSON_RESPONSE",
      endpoint: context?.endpoint,
      method: context?.method,
      url: context?.url,
      details: { ...context, cause: error, bodyText: text },
    });
  }
}

function getHttpCode(statusCode: number) {
  return `HTTP_${statusCode}`;
}

function createApiError(
  response: Response,
  payload: unknown,
  context?: ApiRequestDebugContext,
) {
  const apiBody = isApiErrorBody(payload) ? payload : undefined;
  const statusCode = apiBody?.statusCode ?? response.status;
  const code = apiBody?.code ?? apiBody?.errorCode ?? getHttpCode(statusCode);
  const requestId = apiBody?.requestId ?? response.headers.get("x-request-id") ?? undefined;
  const details = { ...context, bodyJson: payload };
  const message = getUserFriendlyErrorMessage(
    new ApiClientError(apiBody?.message ?? fallbackApiErrorMessage, {
      statusCode,
      code,
      requestId,
      endpoint: context?.endpoint,
      method: context?.method,
      url: context?.url,
      details,
    }),
  );

  if (statusCode === 401) {
    return new UnauthorizedError(message, code, requestId, details);
  }

  if (statusCode === 403) {
    return new ForbiddenError(message, code, requestId, details);
  }

  if (statusCode === 404) {
    return new NotFoundError(message, code, requestId, details);
  }

  if (statusCode === 409) {
    return new ConflictError(message, code, requestId, details);
  }

  if (statusCode === 400 || statusCode === 422) {
    return new ValidationError(message, statusCode, code, requestId, details);
  }

  if ([408, 429, 502, 503, 504].includes(statusCode)) {
    return new ApiUnavailableError(message, statusCode, code, requestId, details);
  }

  return new UnexpectedApiError(message, statusCode, code, requestId, details);
}

async function throwApiError(
  response: Response,
  context?: ApiRequestDebugContext,
): Promise<never> {
  let payload: unknown;

  try {
    payload = await parseResponseBody(response, context);
  } catch (error) {
    if (error instanceof ApiClientError) {
      logApiError(error);
      throw error;
    }

    payload = undefined;
  }

  const apiError = createApiError(response, payload, context);

  if (!isExpectedUnauthenticatedResponse(response, context)) {
    logApiError(apiError);
  }

  throw apiError;
}

export function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const buildGatewayUrl = buildApiUrl;

function shouldAttemptAuthRefresh(
  response: Response,
  options: ApiFetchOptions,
  endpoint: string,
) {
  if (response.status !== 401 || options.skipAuthRetry) {
    return false;
  }

  return (
    options.authenticated !== false &&
    endpoint !== "/api/auth/me" &&
    endpoint !== "/api/auth/refresh" &&
    endpoint !== "/api/auth/logout" &&
    !endpoint.startsWith("/api/auth/google")
  );
}

async function refreshAuthOnce() {
  if (!refreshPromise) {
    const endpoint = "/api/auth/refresh";
    const method = "POST";
    const url = buildApiUrl(endpoint);
    const context = { endpoint, method, url };

    refreshPromise = fetch(url, {
      method,
      credentials: "include",
      cache: "no-store",
      headers: createHeaders({ method }),
    })
      .then(async (response) => {
        if (response.ok) {
          return true;
        }

        if (response.status === 401) {
          return false;
        }

        return throwApiError(response, context);
      })
      .catch((error) => {
        if (error instanceof ApiClientError) {
          throw error;
        }

        throw new ApiUnavailableError(
          getUserFriendlyErrorMessage(
            new ApiClientError("Network request failed.", {
              code: "NETWORK_ERROR",
              endpoint: context.endpoint,
              method: context.method,
              url: context.url,
              details: { ...context, cause: error },
            }),
          ),
          undefined,
          "NETWORK_ERROR",
          undefined,
          { ...context, cause: error },
        );
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { authenticated = true, skipAuthRetry = false, ...requestOptions } =
    options;
  const endpoint = path;
  const method = requestOptions.method ?? "GET";
  const url = buildApiUrl(path);
  const context = { endpoint, method, url };

  try {
    const response = await fetch(url, {
      ...requestOptions,
      cache: "no-store",
      credentials: authenticated ? "include" : requestOptions.credentials,
      headers: createHeaders(requestOptions),
    });

    if (!response.ok) {
      if (
        shouldAttemptAuthRefresh(response, { authenticated, skipAuthRetry }, endpoint)
      ) {
        const refreshed = await refreshAuthOnce();

        if (refreshed) {
          return apiFetch<T>(path, {
            ...requestOptions,
            authenticated,
            skipAuthRetry: true,
          });
        }
      }

      await throwApiError(response, context);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await parseResponseBody(response, context)) as T;
  } catch (error) {
    if (error instanceof ApiError || error instanceof ApiClientError) {
      throw error;
    }

    const networkError = new ApiUnavailableError(
      getUserFriendlyErrorMessage(
        new ApiClientError("Network request failed.", {
          code: "NETWORK_ERROR",
          endpoint: context.endpoint,
          method: context.method,
          url: context.url,
          details: { ...context, cause: error },
        }),
      ),
      undefined,
      "NETWORK_ERROR",
      undefined,
      { ...context, cause: error },
    );

    logApiError(networkError);
    throw networkError;
  }
}

export const gatewayFetch = apiFetch;

export async function apiLiveness(timeoutMs = 3500) {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), timeoutMs);
  const context = {
    endpoint: "/health/liveness",
    method: "GET",
    url: buildApiUrl("/health/liveness"),
  };

  try {
    const response = await fetch(context.url, {
      credentials: "omit",
      cache: "no-store",
      headers: createHeaders({ method: "GET" }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      await throwApiError(response, context);
    }
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    const networkError = new ApiUnavailableError(
      getUserFriendlyErrorMessage(
        new ApiClientError("Network request failed.", {
          code: "NETWORK_ERROR",
          endpoint: context.endpoint,
          method: context.method,
          url: context.url,
          details: { ...context, cause: error },
        }),
      ),
      undefined,
      "NETWORK_ERROR",
      undefined,
      { ...context, cause: error },
    );

    logApiError(networkError);
    throw networkError;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const gatewayLiveness = apiLiveness;
