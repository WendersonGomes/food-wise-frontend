import {
  ApiError,
  ApiUnavailableError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  UnexpectedApiError,
  ValidationError,
} from "@/lib/api/api-errors";
import {
  fallbackApiErrorMessage,
  getApiErrorMessage,
} from "@/lib/api/api-error-messages";

type PublicApiErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
  details?: unknown;
};

type GatewayFetchOptions = RequestInit & {
  authenticated?: boolean;
};

const gatewayEnvName = "NEXT_PUBLIC_GATEWAY_URL";
const networkErrorMessage =
  "Nao foi possivel atualizar as informacoes. Tente novamente em instantes.";
const unavailableMessage =
  "Nao foi possivel atualizar as informacoes. Tente novamente em instantes.";
const loginUnavailableMessage =
  "Nao foi possivel concluir o login agora. Tente novamente em instantes.";

export function getGatewayUrl() {
  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;

  if (!gatewayUrl) {
    throw new Error(`${gatewayEnvName} não foi configurada`);
  }

  return gatewayUrl.replace(/\/$/, "");
}

export const gatewayUrl = getGatewayUrl();

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

function isPublicApiErrorResponse(
  payload: unknown,
): payload is PublicApiErrorResponse {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const record = payload as Record<string, unknown>;

  return (
    typeof record.statusCode === "number" &&
    typeof record.code === "string" &&
    typeof record.message === "string"
  );
}

async function parseErrorResponse(response: Response) {
  try {
    const payload = (await response.json()) as unknown;

    return isPublicApiErrorResponse(payload) ? payload : null;
  } catch {
    return null;
  }
}

function getSafeMessage(
  errorPayload: PublicApiErrorResponse | null,
  fallback: string,
) {
  return getApiErrorMessage(errorPayload?.code, fallback);
}

async function throwApiError(response: Response): Promise<never> {
  const errorPayload = await parseErrorResponse(response);
  const status = errorPayload?.statusCode ?? response.status;
  const code = errorPayload?.code;
  const requestId = errorPayload?.requestId;

  if (status === 401) {
    throw new UnauthorizedError(
      getSafeMessage(errorPayload, "Sua sessão expirou. Entre novamente."),
      code ?? "SESSION_EXPIRED",
      requestId,
    );
  }

  if (status === 403) {
    throw new ForbiddenError(
      getSafeMessage(errorPayload, "Você não tem permissão para executar esta ação."),
      code ?? "FORBIDDEN",
      requestId,
    );
  }

  if (status === 404) {
    throw new NotFoundError(
      getSafeMessage(errorPayload, "O conteúdo solicitado não foi encontrado."),
      code ?? "NOT_FOUND",
      requestId,
    );
  }

  if (status === 409) {
    throw new ConflictError(
      getSafeMessage(
        errorPayload,
        "Este alimento foi alterado em outro dispositivo. Atualize os dados antes de salvar novamente.",
      ),
      code ?? "ITEM_VERSION_CONFLICT",
      requestId,
    );
  }

  if (status === 400 || status === 422) {
    throw new ValidationError(
      getSafeMessage(errorPayload, "Revise os dados informados."),
      status,
      code ?? "VALIDATION_ERROR",
      requestId,
    );
  }

  if ([408, 429, 502, 503, 504].includes(status)) {
    throw new ApiUnavailableError(
      getSafeMessage(errorPayload, unavailableMessage),
      status,
      code ?? (status === 408 || status === 504 ? "UPSTREAM_TIMEOUT" : "SERVICE_UNAVAILABLE"),
      requestId,
    );
  }

  throw new UnexpectedApiError(
    getSafeMessage(errorPayload, fallbackApiErrorMessage),
    status,
    code ?? "UNEXPECTED_ERROR",
    requestId,
  );
}

export function buildGatewayUrl(path: string) {
  return `${gatewayUrl}${path}`;
}

export async function gatewayFetch<T>(
  path: string,
  options: GatewayFetchOptions = {},
): Promise<T> {
  const { authenticated = true, ...requestOptions } = options;

  try {
    const response = await fetch(buildGatewayUrl(path), {
      ...requestOptions,
      credentials: authenticated ? "include" : requestOptions.credentials,
      headers: createHeaders(requestOptions),
    });

    if (!response.ok) {
      await throwApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiUnavailableError(networkErrorMessage, undefined, "NETWORK_ERROR");
  }
}

export async function gatewayLiveness(timeoutMs = 3500) {
  const abortController = new AbortController();
  const timeoutId = window.setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(buildGatewayUrl("/health/liveness"), {
      credentials: "omit",
      signal: abortController.signal,
    });

    if (response.ok) {
      return;
    }

    throw new ApiUnavailableError(
      loginUnavailableMessage,
      response.status,
      "AUTH_SERVICE_UNAVAILABLE",
    );
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      throw error;
    }

    throw new ApiUnavailableError(loginUnavailableMessage, undefined, "NETWORK_ERROR");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
