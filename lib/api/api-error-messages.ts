export const fallbackApiErrorMessage =
  "Não foi possível concluir a operação. Tente novamente.";

const apiErrorMessages: Record<string, string> = {
  NETWORK_ERROR:
    "Nao foi possivel atualizar as informacoes. Tente novamente em instantes.",
  AUTH_SERVICE_UNAVAILABLE:
    "Nao foi possivel concluir o login agora. Tente novamente em instantes.",
  INVENTORY_SERVICE_UNAVAILABLE:
    "Nao foi possivel carregar o estoque agora. Tente novamente em instantes.",
  UPSTREAM_TIMEOUT:
    "A operacao demorou mais do que o esperado. Tente novamente.",
  SESSION_EXPIRED: "Sua sessão expirou. Entre novamente.",
  ITEM_VERSION_CONFLICT:
    "Este alimento foi alterado em outro dispositivo. Atualize os dados antes de salvar novamente.",
  CATEGORY_ALREADY_EXISTS: "Já existe uma categoria com esse nome.",
  INVALID_CATEGORY: "A categoria selecionada não está disponível.",
  PHOTO_TOO_LARGE: "A imagem excede o tamanho máximo permitido.",
  INVALID_PHOTO_TYPE: "Envie uma imagem JPEG ou WebP válida.",
  VALIDATION_ERROR: "Revise os dados informados.",
  NOT_FOUND: "O conteúdo solicitado não foi encontrado.",
  SERVICE_UNAVAILABLE:
    "Nao foi possivel atualizar as informacoes. Tente novamente em instantes.",
  FORBIDDEN: "Você não tem permissão para executar esta ação.",
  UNEXPECTED_ERROR: fallbackApiErrorMessage,
};

export const loginErrorMessages: Record<string, string> = {
  auth_temporarily_unavailable:
    "Não foi possível concluir seu login agora. Tente novamente em alguns instantes.",
  oauth_code_missing:
    "Não foi possível concluir o login. Inicie o processo novamente.",
  oauth_failed: "O login não foi concluído. Tente novamente.",
};

export function getApiErrorMessage(
  code?: string,
  fallback = fallbackApiErrorMessage,
) {
  return code ? apiErrorMessages[code] ?? fallback : fallback;
}

export function getLoginErrorMessage(errorCode?: string | null) {
  if (!errorCode) {
    return null;
  }

  return loginErrorMessages[errorCode] ?? "O login não foi concluído. Tente novamente.";
}
