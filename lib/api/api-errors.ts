export type ApiErrorBody = {
  statusCode?: number;
  code?: string;
  errorCode?: string;
  message?: string;
  requestId?: string;
};

type ApiClientErrorOptions = {
  message?: string;
  statusCode?: number;
  code?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  url?: string;
  details?: unknown;
};

export class ApiClientError extends Error {
  statusCode?: number;
  code?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  url?: string;
  details?: unknown;

  constructor(params: ApiClientErrorOptions);
  constructor(message?: string, options?: ApiClientErrorOptions);
  constructor(
    paramsOrMessage: ApiClientErrorOptions | string = {},
    options: ApiClientErrorOptions = {},
  ) {
    const params =
      typeof paramsOrMessage === "string"
        ? { ...options, message: paramsOrMessage }
        : paramsOrMessage;

    super(params.message ?? "Algo deu errado. Tente novamente.");
    this.name = "ApiClientError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.requestId = params.requestId;
    this.endpoint = params.endpoint;
    this.method = params.method;
    this.url = params.url;
    this.details = params.details;
  }

  get status() {
    return this.statusCode;
  }
}

export class ApiError extends ApiClientError {
  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    requestId?: string,
    details?: unknown,
  ) {
    const detailRecord =
      typeof details === "object" && details !== null
        ? (details as Record<string, unknown>)
        : undefined;

    super(message, {
      statusCode,
      code,
      requestId,
      endpoint:
        typeof detailRecord?.endpoint === "string"
          ? detailRecord.endpoint
          : undefined,
      method:
        typeof detailRecord?.method === "string" ? detailRecord.method : undefined,
      url: typeof detailRecord?.url === "string" ? detailRecord.url : undefined,
      details,
    });
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message = "Sua sessao expirou. Faca login novamente.",
    code = "AUTH_UNAUTHORIZED",
    requestId?: string,
    details?: unknown,
  ) {
    super(message, 401, code, requestId, details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message = "Voce nao tem permissao para executar esta acao.",
    code = "FORBIDDEN",
    requestId?: string,
    details?: unknown,
  ) {
    super(message, 403, code, requestId, details);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(
    message = "Recurso nao encontrado.",
    code = "HTTP_404",
    requestId?: string,
    details?: unknown,
  ) {
    super(message, 404, code, requestId, details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(
    message = "Este alimento foi alterado em outro dispositivo. Atualize os dados antes de salvar novamente.",
    code = "ITEM_VERSION_CONFLICT",
    requestId?: string,
    details?: unknown,
  ) {
    super(message, 409, code, requestId, details);
    this.name = "ConflictError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = "Revise os dados informados.",
    statusCode = 422,
    code = "VALIDATION_ERROR",
    requestId?: string,
    details?: unknown,
  ) {
    super(message, statusCode, code, requestId, details);
    this.name = "ValidationError";
  }
}

export class ApiUnavailableError extends ApiError {
  constructor(
    message = "Nao foi possivel conectar ao servidor. Verifique se a API esta rodando.",
    statusCode?: number,
    code = "NETWORK_ERROR",
    requestId?: string,
    details?: unknown,
  ) {
    super(message, statusCode, code, requestId, details);
    this.name = "ApiUnavailableError";
  }
}

export class UnexpectedApiError extends ApiError {
  constructor(
    message = "Algo deu errado. Tente novamente.",
    statusCode?: number,
    code = statusCode ? `HTTP_${statusCode}` : "UNEXPECTED_ERROR",
    requestId?: string,
    details?: unknown,
  ) {
    super(message, statusCode, code, requestId, details);
    this.name = "UnexpectedApiError";
  }
}

export function isApiUnavailableError(error: unknown): boolean {
  return (
    error instanceof ApiUnavailableError ||
    (error instanceof ApiClientError && error.code === "NETWORK_ERROR")
  );
}

export function isUnauthorizedApiError(error: unknown): boolean {
  return (
    error instanceof UnauthorizedError ||
    (error instanceof ApiClientError && error.statusCode === 401)
  );
}

export function isRetryableApiError(error: unknown): boolean {
  if (!(error instanceof ApiClientError)) {
    return false;
  }

  return (
    error.code === "NETWORK_ERROR" ||
    error.statusCode === 408 ||
    error.statusCode === 429 ||
    error.statusCode === 502 ||
    error.statusCode === 503 ||
    error.statusCode === 504
  );
}
