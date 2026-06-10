import { useContext } from "react";
import { ApiConnectionContext } from "@/contexts/ApiConnectionContext";

export function useApiConnection() {
  const context = useContext(ApiConnectionContext);

  if (!context) {
    throw new Error(
      "useApiConnection deve ser usado dentro de ApiConnectionProvider",
    );
  }

  return context;
}
