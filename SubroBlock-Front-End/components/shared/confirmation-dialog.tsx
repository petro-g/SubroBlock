import React from "react";
import { useConfirmationModal } from "@/components/shared/use-confirmation-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

export default function ConfirmationDialog() {
  const { modal, closeModal } = useConfirmationModal();

  const {
    title,
    isOpen,
    description,

    onCancel,
    cancelText,
    onConfirm,
    confirmText
  } = modal;

  return (
    <AlertDialog
      open={isOpen} // opened externally
      onOpenChange={(isOpen) => !isOpen && closeModal()} // internally closed
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-center">{description}</AlertDialogDescription>
        <AlertDialogFooter className="sm:justify-between sm:space-x-6 mt-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="w-full"
          >
            {cancelText || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full"
          >
            {confirmText || "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
