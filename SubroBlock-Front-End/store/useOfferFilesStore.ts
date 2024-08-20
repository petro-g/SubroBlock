import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";
import {
  URL_GET_BIG_FILE_UPLOAD_SIGNED_URL,
  URL_GET_FILE_SIGNED_URL,
  URL_POST_COMPLETE_BIG_FILE_UPLOAD,
  URL_POST_COMPLETE_SMALL_FILE_UPLOAD,
  URL_POST_INITIATE_BIG_FILE_UPLOAD,
  URL_TEMPLATE_DELETE_OFFER_FILE,
  URL_TEMPLATE_GET_OFFER_FILES
} from "@/lib/constants/api-urls";
import {
  BIG_FILE_MAX_SIZE,
  BIG_FILE_MULTIPART_SIZE
} from "@/lib/constants/static";
import fetchAPI from "@/lib/fetchAPI";
import {
  INITIAL_OFFERS_STORE_DATA,
  IOfferFile,
  IOfferFilesStoreActions,
  IOffersStore
} from "@/store/types/offerFiles";
import { IFetchOfferFileSignedUrl } from "@/store/types/offers";

const fileNameToType = (fileName: string) => "." + fileName.split(".").pop();

export const useOfferFilesStore = create<IOffersStore & IOfferFilesStoreActions>((set, get) => {
  return {
    ...INITIAL_OFFERS_STORE_DATA,
    uploadSmallFile: async (file, selectedOffer, onProgressUpdateCallback) => {
      console.log("Uploading small file...");
      if (!selectedOffer) return Promise.reject("No offer selected");

      const params = {
        permission: "put_object",
        company: selectedOffer?.issuerCompanyId,
        folderName: selectedOffer?.id,
        fileName: file.name
      };

      onProgressUpdateCallback(5);

      const {
        ok,
        data
      } = await fetchAPI<IFetchOfferFileSignedUrl>(URL_GET_FILE_SIGNED_URL, {
        method: "POST",
        body: JSON.stringify(params)
      });

      if (!ok) return Promise.reject("Failed to get signed URL");

      onProgressUpdateCallback(20);

      const { url: signedUrl, key, uuid } = data;

      if (!signedUrl) return Promise.reject("No signed URL");

      onProgressUpdateCallback(30);

      const uploadResponse = await fetchAPI(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      if (!uploadResponse.ok) return Promise.reject("Failed to upload file");

      onProgressUpdateCallback(75);

      await get().saveUploadedFileToOffer(file, uuid, key, selectedOffer);

      console.log(`File ${file.name} uploaded successfully`);

      onProgressUpdateCallback(100);
    },
    uploadBigFile: async (file, selectedOffer, onProgressUpdateCallback) => {
      console.log("Uploading big file in parts...");

      if (!selectedOffer) return Promise.reject("No offer selected");

      onProgressUpdateCallback(5);

      // Initiate multipart upload
      const { data: initRes } = await fetchAPI<IFetchOfferFileSignedUrl & {
        uploadId: string
      }>(URL_POST_INITIATE_BIG_FILE_UPLOAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          company: selectedOffer.issuerCompanyId,
          folderName: selectedOffer.id
        })
      });

      if (!initRes) return Promise.reject("Failed to initiate multipart upload");

      onProgressUpdateCallback(10);

      const { uploadId, key, uuid } = initRes;

      const numParts = Math.ceil(file.size / BIG_FILE_MULTIPART_SIZE);
      const promises = [];
      const parts = [];

      for (let partNumber = 1; partNumber <= numParts; partNumber++) {
        const start = (partNumber - 1) * BIG_FILE_MULTIPART_SIZE;
        const end = Math.min(start + BIG_FILE_MULTIPART_SIZE, file.size);
        const part = file.slice(start, end);

        const { data: presignedUrlResponse } = await fetchAPI<{ url: string }>(
          URL_GET_BIG_FILE_UPLOAD_SIGNED_URL,
          {
            method: "POST",
            body: JSON.stringify({
              partNumber: partNumber.toString(),
              uploadId,
              key
            })
          },
        );

        onProgressUpdateCallback(10 + (partNumber / numParts) * 50);

        if (!presignedUrlResponse) {
          throw new Error("Failed to get presigned URL for part upload");
        }

        const { url } = presignedUrlResponse;

        const uploadPartRes = await fetch(
          url,
          {
            method: "PUT",
            body: part,
            headers: {
              "Content-Type": "application/octet-stream"
            }
          });

        if (!uploadPartRes) {
          throw new Error("Failed to upload part");
        }

        onProgressUpdateCallback(10 + (partNumber / numParts) * 80);

        const ETag = uploadPartRes.headers.get("ETag");

        if (!ETag) {
          throw new Error("Failed to get ETag");
        }

        parts.push({
          ETag: JSON.parse(ETag), // without parse, it will be as: "\"ETag\""
          PartNumber: partNumber
        });

        promises.push(uploadPartRes);
      }

      await Promise.all(promises);

      // Complete multipart upload
      const { ok, error } = await fetchAPI(URL_POST_COMPLETE_BIG_FILE_UPLOAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid,
          uploadId,
          key,
          parts
        })
      });

      onProgressUpdateCallback(90);

      if (ok) {
        await get().saveUploadedFileToOffer(file, uuid, key, selectedOffer);

        onProgressUpdateCallback(100);

        console.log(`File ${file.name} uploaded successfully in multi-parts`);
        toast({
          variant: "success",
          title: `File ${file.name} uploaded successfully in multi-parts`
        });
      } else {
        console.error("Failed to complete multipart upload", error);
        toast({
          variant: "error",
          title: "Failed to complete multipart upload",
          description: error?.toString() || "Unknown error"
        });
      }
    },
    fetchOfferFiles: async (offerId, clearCache) => {
      const url = URL_TEMPLATE_GET_OFFER_FILES(offerId);

      if (clearCache)
        // clean up previous files to be sure we don't show old files
        set({ offerFiles: null });

      const { ok, data } = await fetchAPI<{ data: IOfferFile[] }>(
        url,
        { method: "GET" },
        { errorToast: { title: "Error fetching offers" } }
      );

      if (ok) set({ offerFiles: data.data });
      else set({ offerFiles: [] });
    },
    saveUploadedFileToOffer: async (file, uuid, key, selectedOffer) => {
      const postFileResponse = await fetchAPI(URL_POST_COMPLETE_SMALL_FILE_UPLOAD, {
        method: "POST",
        body: JSON.stringify({
          uuid,
          key,
          fileName: file.name,
          fileFormat: fileNameToType(file.name),
          offerId: selectedOffer?.id
        } as IOfferFile)
      }, {
        successToast: { title: `File ${file.name} uploaded successfully` }
      });

      if (!postFileResponse.ok) {
        throw new Error("Failed to post file");
      }
    },
    downloadFile: async (file, selectedOffer, openNewTab) => {
      if (!selectedOffer) return;

      const params = {
        permission: "get_object",
        company: selectedOffer.issuerCompanyId,
        folderName: selectedOffer.id,
        fileName: file.uuid + file.fileFormat
      };

      try {
        const { ok, data } = await fetchAPI<{
          url: string
        }>(URL_GET_FILE_SIGNED_URL, {
          method: "POST",
          body: JSON.stringify(params)
        });

        if (!ok) return;

        const { url } = data;
        const link = document.createElement("a");
        link.download = file.fileName + file.fileFormat;
        link.href = url;
        link.target = "_blank";

        if (!openNewTab) {
          // to avoid opening in new tab, parse the content of file and save manually as blob
          // local opening of files ignores server response headers, so even if downloading forbidden - we still do it
          const response = await fetch(url, { method: "GET" });
          const blob = await response.blob();

          link.href = window.URL.createObjectURL(new Blob([blob]));
        }

        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      } catch (error) {
        console.error("An error occurred while downloading file:", error);
      }
    },
    deleteFile: async (file, selectedOffer) => {
      if (!selectedOffer) return Promise.reject("No offer selected");

      const responseAPI = await fetchAPI(
        URL_TEMPLATE_DELETE_OFFER_FILE(file.uuid),
        { method: "DELETE" },
        { successToast: { title: `File ${file.fileName} deleted successfully` } }
      );

      await get().fetchOfferFiles(selectedOffer.id);

      return responseAPI;
    },
    uploadAnySizeFile: async (file, selectedOffer, onProgressUpdateCallback) => {
      if (file.size > BIG_FILE_MAX_SIZE) {
        return Promise.reject("File is too big. Maximum size is " + BIG_FILE_MAX_SIZE / 1024 / 1024 + "MB");
      }

      if (file.size > BIG_FILE_MULTIPART_SIZE) {
        await get().uploadBigFile(file, selectedOffer, onProgressUpdateCallback);
      } else {
        await get().uploadSmallFile(file, selectedOffer, onProgressUpdateCallback);
      }
    }
  };
});
