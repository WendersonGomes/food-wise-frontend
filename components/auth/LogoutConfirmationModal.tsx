"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";

type LogoutConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoggedOut?: () => void;
};

export function LogoutConfirmationModal({
  isOpen,
  onClose,
  onLoggedOut,
}: LogoutConfirmationModalProps) {
  function handleLoggedOut() {
    onClose();
    onLoggedOut?.();
  }

  return (
    <Modal isOpen={isOpen} title="Encerrar sessão" onClose={onClose}>
      <p className="text-sm leading-6 text-(--muted-foreground)">
        Sua sessão será encerrada neste navegador.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <LogoutButton variant="danger" onLoggedOut={handleLoggedOut} />
      </div>
    </Modal>
  );
}
