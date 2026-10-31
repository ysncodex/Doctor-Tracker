'use client';

import { Loader2 } from 'lucide-react';

import { Modal } from '@/components/ui/modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  isPending = false,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} size="sm" onClose={onCancel} dismissible={!isPending}>
      <div className="space-y-4 p-5">
        <p className="text-sm text-ink/80">{description}</p>

        {errorMessage && (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="btn-danger"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
