import { getSession, signOut } from "next-auth/react";
import { Toast, toast } from "@/components/ui/use-toast";
import { isJsonResponse, tryParseErrorMessage } from "@/lib/fetchAPI.utils";

interface ApiRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array> | null | undefined;
}

interface ExtraOptionsAPI {
  successToast?: Toast; // by default not shown, add prop manually if needed
  errorToast?: Toast | false; // shown by default for any error, set "false" to hide it
}

export interface ResponseAPI<DATA = unknown> {
  ok: boolean;
  data: DATA; // returned on success, always an object, even if failed and it is empty
  error: unknown; // returned on failure
  response?: Response; // full response object, in case headers or status needed
}

export default async function fetchAPI<DATA>(url: string, options: ApiRequestOptions, extraOptions?: ExtraOptionsAPI): Promise<ResponseAPI<DATA>> {
  await getSession(); // try to get token from session and refresh it in case expired
  // console.log(token);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache", // forbid Next.js server to cache requests
        ...(options.headers || {})
      }
    });

    const data = isJsonResponse(response) ? await response.json() : await response.text();

    if (response.ok && extraOptions?.successToast)
      toast({
        title: "Success",
        variant: "success",
        ...extraOptions.successToast
      });

    if (response.status === 401) {
      console.error(new Date().toTimeString(), "Unauthorized request, logging out...");
      await signOut({ redirect: false });
      window.location.reload();
    }

    // by default show error toast, optionally disable
    if (!response.ok && extraOptions?.errorToast !== false)
      toast({
        title: "Error",
        variant: "error",
        description: tryParseErrorMessage(data || `${response.status} ${response.statusText}`),
        ...extraOptions?.errorToast
      });

    return {
      ok: response.ok,
      data: response.ok ? data : {} as DATA,
      error: response.ok ? {} : data,
      response
    };
  } catch (error: unknown) {
    // just in case if fetch fails
    if (extraOptions?.errorToast !== false)
      toast({
        title: "Error",
        variant: "error",
        ...extraOptions?.errorToast,
        description: tryParseErrorMessage(error)
      });

    return {
      ok: false,
      data: {} as DATA,
      error: error
    }
  }
}
