"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import FilesFooter from "@/components/shared/UploadFile/FilesFooter";
import { handleFileUpload } from "@/components/shared/UploadFile/handleFileUpload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import useLoading from "@/lib/hooks/useLoading";
import { cn } from "@/lib/utils";
import AttachFileRedIcon from "@/public/attach-file-red.svg";
import AttachFileIcon from "@/public/attach-file.svg";
import { IOfferFile } from "@/store/types/offerFiles";
import { useOfferFilesStore } from "@/store/useOfferFilesStore";
import { useOffersStore } from "@/store/useOffersStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import FileCard from "./FileCard";

export type TAllowedFileFormats =
  | ".pdf"
  | ".doc"
  | ".docx"
  | ".xls"
  | ".xlsx"
  | ".jpeg"
  | ".jpg"
  | ".png"
  | ".heic"
  | ".txt"
  | ".move";
export const ALLOWED_FILE_FORMATS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".jpeg",
  ".jpg",
  ".png",
  ".heic",
  ".txt",
  ".move"
] as const;

const OfferFiles_PanelContent = () => {
  const { setOpenPanel } = useSidePanelStore();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItems, setSelectedItems] = useState<IOfferFile["uuid"][]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<
    Record<IOfferFile["fileName"], number>
  >({});
  const [failedFiles, setFailedFiles] = useState<
    Record<IOfferFile["fileName"], File>
  >({});
  const [loading, withLoading] = useLoading();
  const { selectedOffer } = useOffersStore();
  const currentUser = useCurrentUser();
  const hasFilesEditAccess =
    currentUser?.organization?.organizationId ===
    selectedOffer?.issuerCompanyId;

  const {
    offerFiles,
    fetchOfferFiles,
    uploadAnySizeFile
  } = useOfferFilesStore();

  useEffect(() => {
    if (selectedOffer) fetchOfferFiles(selectedOffer.id, true);
    else setOpenPanel(null);
  }, [selectedOffer]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectAllCheckboxChange = () => {
    const selectAllChecked = selectedItems.length === offerFiles?.length;
    if (!selectAllChecked && offerFiles) {
      setSelectedItems(offerFiles?.map((item) => item.uuid));
    } else {
      setSelectedItems([]);
    }
  };

  const handleCheckboxChange = (fileUuid: IOfferFile["uuid"]) => {
    setSelectedItems((prev) =>
      prev.includes(fileUuid)
        ? prev.filter((id) => id !== fileUuid)
        : [...prev, fileUuid]
    );
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectedOffer) return;

    const files = event.target.files;
    if (!files) return;

    await handleFileUpload(selectedOffer, files, setUploadingFiles, setFailedFiles, uploadAnySizeFile);

    // fetch new files
    await withLoading(() => fetchOfferFiles(selectedOffer.id, true));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange({
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="-mt-6 overflow-y-scroll max-h-[calc(100vh-76px)]">
      {offerFiles && offerFiles.length > 0 && (
        <div
          className="flex items-center text-sm absolute top-6 right-6 cursor-pointer hover:text-accent-foreground"
          onClick={handleSelectAllCheckboxChange}
        >
          <Checkbox
            checked={selectedItems.length === offerFiles.length}
            onClick={handleSelectAllCheckboxChange}
            className={cn(
              "w-6 h-6 text-white rounded-sm border-background-secondary focus:outline-none mr-3",
              selectedItems.length === offerFiles.length &&
                "!bg-accent-foreground"
            )}
          />
          Select All
        </div>
      )}
      <div className="my-6 w-[466px] grid grid-cols-2 gap-4">
        {hasFilesEditAccess && (
          <label
            htmlFor="file-upload"
            className={cn(
              "rounded-lg w-[225px] h-[159px] border bg-accent hover:bg-accent-muted border-accent-foreground border-dashed justify-center items-center flex cursor-pointer",
              isDragging && "bg-accent-muted",
              Object.keys(failedFiles).length &&
                "border-destructive bg-destructive-foreground cursor-not-allowed"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              accept={ALLOWED_FILE_FORMATS.join(",")}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex text-sm items-center mt-1",
                  Object.keys(failedFiles).length
                    ? "text-destructive"
                    : "text-accent-foreground"
                )}
              >
                <Image
                  src={
                    Object.keys(failedFiles).length
                      ? AttachFileRedIcon
                      : AttachFileIcon
                  }
                  alt="SubroBlock AttachFile"
                  className="mr-2"
                />
                Attach Files
              </div>
              <div
                className={cn(
                  "text-sm text-accent-foreground mt-4 text-center px-8",
                  Object.keys(failedFiles).length
                    ? "text-destructive"
                    : "text-accent-foreground"
                )}
              >
                {ALLOWED_FILE_FORMATS.join(", ")}
              </div>
            </div>
          </label>
        )}

        {uploadingFiles &&
          Object.keys(uploadingFiles).map((fileName) => (
            <FileCard
              key={fileName}
              fileName={fileName}
              className={cn(
                "rounded-lg cursor-progress relative overflow-hidden bg-background-secondary",
                uploadingFiles[fileName] === -1 &&
                  "border-destructive bg-destructive-foreground cursor-not-allowed"
              )}
              uploadProgress={uploadingFiles[fileName]}
            />
          ))}

        {failedFiles &&
          Object.keys(failedFiles).map((fileUuid) => (
            <div className="relative" key={fileUuid}>
              <FileCard
                key={fileUuid}
                fileName={failedFiles[fileUuid].name}
                className="rounded-lg cursor-not-allowed relative overflow-hidden bg-destructive-foreground"
              />
              <Button
                className="absolute bottom-4 right-4"
                variant="link"
                onClick={() => {
                  setFailedFiles((prev) => {
                    const { [fileUuid]: _, ...rest } = prev; // eslint-disable-line @typescript-eslint/no-unused-vars
                    return rest;
                  });
                }}
              >
                Discard
              </Button>
              <Button
                className="absolute bottom-4 left-4"
                variant="link"
                onClick={() => {
                  if (selectedOffer) {
                    setFailedFiles((prev) => {
                      const { [fileUuid]: _, ...rest } = prev; // eslint-disable-line @typescript-eslint/no-unused-vars
                      return rest;
                    });
                    handleFileChange({
                      target: {
                        files: [failedFiles[fileUuid]]
                      }
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
              >
                Retry
              </Button>
            </div>
          ))}

        {offerFiles?.map((file) => (
          <FileCard
            key={file.uuid}
            file={file}
            selected={selectedItems.includes(file.uuid)}
            onClick={() => handleCheckboxChange(file.uuid)}
          />
        ))}

        {(!offerFiles || loading) &&
          Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="w-[225px] h-[159px]" />
          ))}
      </div>
      <FilesFooter selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
    </div>
  );
};

export default OfferFiles_PanelContent;
