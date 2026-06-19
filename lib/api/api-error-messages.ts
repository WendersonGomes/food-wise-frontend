import { ApiClientError } from "@/lib/api/api-errors";

export const fallbackApiErrorMessage = "Algo deu errado. Tente novamente.";

const apiErrorMessages: Record<string, string> = {
  AUTH_UNAUTHORIZED: "Sua sessao expirou. Faca login novamente.",
  SESSION_EXPIRED: "Sua sessao expirou. Faca login novamente.",
  AUTH_INTERNAL_ERROR:
    "Nao foi possivel iniciar o login agora. Tente novamente em instantes.",
  AUTH_GOOGLE_OAUTH_URL_FAILED:
    "Nao foi possivel iniciar o login agora. Tente novamente em instantes.",
  AUTH_GOOGLE_OAUTH_URL_MISSING:
    "Nao foi possivel iniciar o login agora. Tente novamente em instantes.",
  INTERNAL_AUTH_FAILED:
    "Nao foi possivel iniciar o login agora. Tente novamente em instantes.",
  AUTH_SERVICE_UNAVAILABLE:
    "Nao foi possivel iniciar o login agora. Tente novamente em instantes.",
  NETWORK_ERROR:
    "Nao foi possivel conectar ao servidor. Verifique se a API esta rodando.",
  HTTP_401: "Sua sessao expirou. Faca login novamente.",
  HTTP_404: "Recurso nao encontrado.",
  HTTP_500: "Erro interno no servidor. Tente novamente em instantes.",
  HTTP_503:
    "Nao foi possivel conectar ao servidor. Verifique se a API esta rodando.",
  INVENTORY_SERVICE_UNAVAILABLE:
    "Nao foi possivel carregar o estoque agora. Tente novamente em instantes.",
  UPSTREAM_TIMEOUT:
    "A operacao demorou mais do que o esperado. Tente novamente.",
  ITEM_VERSION_CONFLICT:
    "Este item foi atualizado. Recarregamos os dados mais recentes; revise e tente salvar novamente.",
  ITEM_CREATE_TIMEOUT_AMBIGUOUS:
    "O servidor demorou para responder. Verifique se o item foi criado antes de tentar novamente.",
  HTTP_504: "O servico demorou para responder. Tente novamente.",
  CATEGORY_ALREADY_EXISTS: "Ja existe uma categoria com esse nome.",
  INVALID_CATEGORY: "A categoria selecionada nao esta disponivel.",
  PHOTO_TOO_LARGE: "A imagem excede o tamanho maximo permitido.",
  INVALID_PHOTO_TYPE: "Envie uma imagem JPEG ou WebP valida.",
  VALIDATION_ERROR: "Revise os dados informados.",
  NOT_FOUND: "Recurso nao encontrado.",
  FORBIDDEN: "Voce nao tem permissao para executar esta acao.",
  WRITE_BLOCKED: "Nao foi possivel salvar alteracoes no momento.",
  EMPTY_API_RESPONSE: "Algo deu errado. Tente novamente.",
  UNEXPECTED_ERROR: fallbackApiErrorMessage,
};

export const loginErrorMessages: Record<string, string> = {
  auth_temporarily_unavailable:
    "Nao foi possivel concluir seu login agora. Tente novamente em alguns instantes.",
  oauth_code_missing:
    "Nao foi possivel concluir o login. Inicie o processo novamente.",
  oauth_failed: "O login nao foi concluido. Tente novamente.",
  AUTH_INTERNAL_ERROR:
    "Nao foi possivel iniciar o login agora. Tente novamente em instantes.",
  AUTH_GOOGLE_OAUTH_URL_FAILED:
    "Nao foi possivel iniciar o login agora. Tente novamente em instantes.",
  AUTH_GOOGLE_OAUTH_URL_MISSING:
    "Nao foi possivel iniciar o login agora. Tente novamente em instantes.",
  INTERNAL_AUTH_FAILED:
    "Nao foi possivel iniciar o login agora. Tente novamente em instantes.",
  AUTH_UNAUTHORIZED: "Sua sessao expirou. Faca login novamente.",
};

export function getApiErrorMessage(
  code?: string,
  fallback = fallbackApiErrorMessage,
) {
  return code ? apiErrorMessages[code] ?? fallback : fallback;
}

export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    const codeMessage = getApiErrorMessage(error.code);

    if (codeMessage !== fallbackApiErrorMessage) {
      return codeMessage;
    }

    if (error.statusCode) {
      return getApiErrorMessage(`HTTP_${error.statusCode}`);
    }
  }

  if (error instanceof TypeError) {
    return apiErrorMessages.NETWORK_ERROR;
  }

  return fallbackApiErrorMessage;
}

export function getApiErrorSupportCode(error: unknown): string | null {
  if (!(error instanceof ApiClientError) || !error.requestId) {
    return null;
  }

  const supportCode = error.requestId.trim();

  return /^[a-zA-Z0-9._:-]{1,120}$/.test(supportCode) ? supportCode : null;
}

export function getLoginErrorMessage(errorCode?: string | null) {
  if (!errorCode) {
    return null;
  }

  return (
    loginErrorMessages[errorCode] ??
    apiErrorMessages[errorCode] ??
    "O login nao foi concluido. Tente novamente."
  );
}
