import React from "react";
import {
  ALLOWED_FILE_FORMATS,
  TAllowedFileFormats
} from "@/components/shared/UploadFile/OfferFiles_PanelContent";
import { toast } from "@/components/ui/use-toast";
import { IOfferFile } from "@/store/types/offerFiles";
import { IOffer } from "@/store/types/offers";

export const handleFileUpload = async (
  selectedOffer: IOffer,
  files: FileList,
  setUploadingFiles: React.Dispatch<
    React.SetStateAction<Record<IOfferFile["uuid"], number>>
  >,
  setFailedFiles: React.Dispatch<
    React.SetStateAction<Record<IOfferFile["uuid"], File>>
  >,
  uploadAnySizeFile: (
    file: File,
    selectedOffer: IOffer,
    onProgress: (progress: number) => void
  ) => Promise<void>
) => {
  const validFiles = Array.from(files).filter((file) => {
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    return ALLOWED_FILE_FORMATS.includes(fileExtension as TAllowedFileFormats);
  });

  const invalidFiles = Array.from(files).filter(
    (file) => !validFiles.includes(file)
  );
  if (invalidFiles.length > 0) {
    toast({
      title: "Invalid file format",
      description: "Some files have unsupported formats and were not uploaded.",
      variant: "warning"
    });
    // Optionally, add invalid files to failedFiles state
    setFailedFiles((prev) => ({
      ...prev,
      ...invalidFiles.reduce(
        (acc, file) => {
          acc[file.name] = file;
          return acc;
        },
        {} as Record<IOfferFile["uuid"], File>
      )
    }));
  }

  if (validFiles.length === 0) return;

  // set 0% progress for each valid file
  setUploadingFiles((prev) => ({
    ...prev,
    ...validFiles.reduce(
      (acc, file) => ({
        ...acc,
        [file.name]: 0
      }),
      {}
    )
  }));

  for (const file of validFiles) {
    // set 1% progress for this file we just began uploading
    setUploadingFiles((prev) => ({
      ...prev,
      [file.name]: 1
    }));

    // upload file, give callback to update progress from inside
    await uploadAnySizeFile(file, selectedOffer, (progress) =>
      setUploadingFiles((prev) => {
        if (!prev[file.name]) return prev; // in case of error, all progress is cleared after finished, but interval may still be working
        return {
          ...prev,
          [file.name]: progress
        };
      })
    ).catch((error) => {
      if (typeof error === "string")
        toast({
          title: "An error occurred while uploading file",
          description: error || "Unknown error",
          variant: "error"
        });

      // set -1 progress as invalid
      setUploadingFiles((prev) => {
        if (!prev[file.name]) return prev; // in case of error, all progress is cleared after finished, but interval may still be working
        return {
          ...prev,
          [file.name]: -1
        };
      });
    });
  }

  // clear uploading files
  setUploadingFiles((prevUploadingFiles) => {
    // move uploading files with progress -1 to failed files
    setFailedFiles((prev) =>
      Object.keys(prevUploadingFiles).reduce(
        (acc: Record<IOfferFile["uuid"], File>, fileName) => {
          if (prevUploadingFiles[fileName] === -1) {
            const file = validFiles.find((file) => file.name === fileName);
            if (file) acc[fileName] = file;
          }
          return acc;
        },
        prev
      )
    );

    return {};
  });
};
