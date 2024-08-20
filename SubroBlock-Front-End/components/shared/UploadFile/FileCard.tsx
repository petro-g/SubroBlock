import Image from "next/image";
import React from "react";
import DropdownOptionsMenu from "@/components/shared/DropdownOptionsMenu";
import {
  TAllowedFileFormats
} from "@/components/shared/UploadFile/OfferFiles_PanelContent";
import {
  useConfirmationModal
} from "@/components/shared/use-confirmation-modal";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import DocIcon from "@/public/doc-file.svg";
import DownloadIcon from "@/public/download-icon.svg";
import ImgIcon from "@/public/Image@2x.svg";
import MovIcon from "@/public/mov@2x.svg";
import PdfFileIcon from "@/public/pdf-file.svg";
import RedDeleteIcon from "@/public/red-delete.svg";
import ThreeDotsIcon from "@/public/three-dots.svg";
import XlsxIcon from "@/public/xlsx-file.svg";
import { IOfferFile } from "@/store/types/offerFiles";
import { useOfferFilesStore } from "@/store/useOfferFilesStore";
import { useOffersStore } from "@/store/useOffersStore";
import "react-circular-progressbar/dist/styles.css";

interface FileItemProps {
  file?: IOfferFile;
  fileName?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  uploadProgress?: number; // 0 - 100
}

const getFileIcon = (file: IOfferFile) => {
  const fileExtension = ("." +
    file.fileFormat?.split(".").pop()?.toLowerCase()) as TAllowedFileFormats;
  switch (fileExtension) {
    case ".pdf":
      return <Image src={PdfFileIcon} alt="PDF File" />;
    case ".xlsx":
    case ".xls":
      return <Image src={XlsxIcon} alt="XLSX File" />;
    case ".doc":
    case ".docx":
      return <Image src={DocIcon} alt="DOC File" />;
    case ".jpeg":
    case ".jpg":
    case ".png":
      return <Image src={ImgIcon} alt="IMG file" />;
    case ".move":
      return <Image src={MovIcon} alt="MOV file" />;
    default:
      return null;
  }
};

const FileCard: React.FC<FileItemProps> = ({
  file,
  selected,
  onClick,
  className,
  fileName = file?.fileName,
  uploadProgress
}) => {
  const { selectedOffer } = useOffersStore();
  const { openModal } = useConfirmationModal();
  const currentUser = useCurrentUser();

  const { downloadFile, deleteFile } = useOfferFilesStore();

  return (
    <div
      className={cn(
        "rounded-lg w-[225px] h-40 border items-center flex flex-col cursor-pointer relative",
        "hover:bg-accent",
        selected && "border-accent-foreground",
        className
      )}
      onClick={onClick}
    >
      {file && (
        <>
          <div className="w-full flex justify-between px-4 pt-3 items-center">
            <DropdownOptionsMenu
              options={[
                {
                  label: "Download",
                  value: "download",
                  onClick: async (_, e) => {
                    e.stopPropagation();
                    if (selectedOffer) await downloadFile(file, selectedOffer);
                  },
                  render: () => (
                    <div className="flex items-center">
                      <Image
                        src={DownloadIcon}
                        alt="SubroBlock DownloadIcon"
                        className="mr-2"
                      />
                      Download
                    </div>
                  )
                },
                {
                  label: "Open in new tab",
                  value: "open",
                  onClick: async (_, e) => {
                    e.stopPropagation();
                    if (selectedOffer)
                      await downloadFile(file, selectedOffer, true);
                  },
                  render: () => (
                    <div className="flex items-center">
                      <Image
                        src={DownloadIcon}
                        alt="SubroBlock DownloadIcon"
                        className="mr-2"
                      />
                      Open
                    </div>
                  )
                },
                currentUser?.organization?.organizationId ===
                selectedOffer?.issuerCompanyId && {
                  label: "Delete",
                  value: "delete",
                  onClick: (_, e) => {
                    e.stopPropagation();
                    if (selectedOffer)
                      openModal({
                        title: "Delete file",
                        description: `Are you sure you want to delete ${file.fileName}?`,
                        onConfirm: () => deleteFile(file, selectedOffer)
                      });
                  },
                  render: () => (
                    <div className="flex items-center">
                      <Image
                        src={RedDeleteIcon}
                        alt="SubroBlock"
                        className="mr-2 text-sm"
                      />
                      Delete
                    </div>
                  )
                }
              ]}
            >
              <div className="hover:bg-secondary rounded-full">
                <Image src={ThreeDotsIcon} alt="SubroBlock ThreeDots" />
              </div>
            </DropdownOptionsMenu>
          </div>
          <div className="relative h-16 w-12">{getFileIcon(file)}</div>
        </>
      )}
      <div className="flex text-sm pb-5 pt-4 text-center">{fileName}</div>
      {Boolean(uploadProgress) && (
        <div
          className="w-full h-3 absolute bottom-0 bg-accent-active transition-all"
          style={{
            width: `${Math.max(0, uploadProgress || 0)}%`,
            left: 0,
            right: 0
          }}
        />
      )}
    </div>
  );
};

export default FileCard;
