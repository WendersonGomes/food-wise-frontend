export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message = "Sua sessão expirou. Entre novamente.",
    code = "SESSION_EXPIRED",
    requestId?: string,
  ) {
    super(message, 401, code, requestId);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    message = "Você não tem permissão para executar esta ação.",
    code = "FORBIDDEN",
    requestId?: string,
  ) {
    super(message, 403, code, requestId);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(
    message = "O conteúdo solicitado não foi encontrado.",
    code = "NOT_FOUND",
    requestId?: string,
  ) {
    super(message, 404, code, requestId);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(
    message = "Este alimento foi alterado em outro dispositivo. Atualize os dados antes de salvar novamente.",
    code = "ITEM_VERSION_CONFLICT",
    requestId?: string,
  ) {
    super(message, 409, code, requestId);
    this.name = "ConflictError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = "Revise os dados informados.",
    status = 422,
    code = "VALIDATION_ERROR",
    requestId?: string,
  ) {
    super(message, status, code, requestId);
    this.name = "ValidationError";
  }
}

export class ApiUnavailableError extends ApiError {
  constructor(
    message = "Nao foi possivel atualizar as informacoes. Tente novamente em instantes.",
    status = 503,
    code = "SERVICE_UNAVAILABLE",
    requestId?: string,
  ) {
    super(message, status, code, requestId);
    this.name = "ApiUnavailableError";
  }
}

export class UnexpectedApiError extends ApiError {
  constructor(
    message = "Não foi possível concluir a operação. Tente novamente.",
    status?: number,
    code = "UNEXPECTED_ERROR",
    requestId?: string,
  ) {
    super(message, status, code, requestId);
    this.name = "UnexpectedApiError";
  }
}

export function isApiUnavailableError(error: unknown): boolean {
  return error instanceof ApiUnavailableError;
}

export function isRetryableApiError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    error.code === "NETWORK_ERROR" ||
    error.status === 408 ||
    error.status === 429 ||
    error.status === 502 ||
    error.status === 503 ||
    error.status === 504
  );
}
