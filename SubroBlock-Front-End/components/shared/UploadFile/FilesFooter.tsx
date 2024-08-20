import Image from "next/image";
import React from "react";
import { useConfirmationModal } from "@/components/shared/use-confirmation-modal";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { pluralize } from "@/lib/utils";
import DownloadIcon from "@/public/download-icon.svg";
import RemoveSelectIcon from "@/public/remove-select.svg";
import TrashIcon from "@/public/trash.svg";
import { useOfferFilesStore } from "@/store/useOfferFilesStore";
import { useOffersStore } from "@/store/useOffersStore";

interface IFileFooterProps {
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
}

const FilesFooter = ({ selectedItems, setSelectedItems }: IFileFooterProps) => {
  const { openModal } = useConfirmationModal();
  const { selectedOffer } = useOffersStore();

  const currentUser = useCurrentUser();
  const hasFilesEditAccess =
    currentUser?.organization?.organizationId ===
    selectedOffer?.issuerCompanyId;

  const {
    offerFiles,
    downloadFile,
    deleteFile
  } = useOfferFilesStore();

  return selectedItems.length > 0 && (
    <div className="w-[467px] h-[72px] bg-primary-foreground rounded-[10px] flex justify-between items-center px-[24px] py-[20px] absolute bottom-[20px]">
      <div className="flex items-center">
        <Image
          src={RemoveSelectIcon}
          alt="SubroBlock RemoveSelectIcon"
          className="cursor-pointer"
          onClick={() => setSelectedItems([])}
        />
        <div className="ml-2 text-background-secondary">
          {selectedItems.length} {pluralize(selectedItems.length, "file", "files")} selected
        </div>
      </div>
      <div className="ml-auto">
        {hasFilesEditAccess && (
          <Button
            onClick={() =>
              selectedOffer &&
              openModal({
                title: `Delete ${selectedItems.length} ${pluralize(selectedItems.length, "file", "files")}`,
                description: `Are you sure you want to delete ${selectedItems.length} ${pluralize(selectedItems.length, "file", "files")}?`,
                onConfirm: async () => {
                  // intentionally ignore promises, don't wait so all files deleted together, not one by one
                  selectedItems.forEach(async (uuid) => {
                    const file = offerFiles?.find(
                      (file) => file.uuid === uuid
                    );
                    if (file && (await deleteFile(file, selectedOffer)).ok)
                      setSelectedItems((prev: string[]) =>
                        prev.filter((id) => id !== uuid)
                      );
                  });
                  toast({
                    title: `Finished deleting ${selectedItems.length} files`
                  });
                }
              })
            }
            variant="outline"
            className="border-destructive"
          >
            <Image
              src={TrashIcon}
              alt="SubroBlock TrashIcon"
              className="mr-2"
            />
            <span className="text-sm text-destructive">Delete</span>
          </Button>
        )}
        <Button
          onClick={() =>
            selectedOffer &&
            selectedItems.forEach((uuid) => {
              const file = offerFiles?.find((file) => file.uuid === uuid);
              if (file) downloadFile(file, selectedOffer);
            })
          }
          variant="outline"
          className="ml-2"
        >
          <Image
            src={DownloadIcon}
            alt="SubroBlock AttachFileIcon"
            className="mr-2"
          />
          <span className="text-sm">Download</span>
        </Button>
      </div>
    </div>
  );
}

export default FilesFooter;
