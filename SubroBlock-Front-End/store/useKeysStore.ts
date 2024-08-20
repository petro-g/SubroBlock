import { create } from "zustand";
import {
  URL_ROOT_ASSIGN_KEY,
  URL_ROOT_GENERATE_KEY,
  URL_ROOT_GET_KEYS, URL_TEMPLATE_ROOT_DELETE_KEY, URL_TEMPLATE_ROOT_RENEW_KEY
} from "@/lib/constants/api-urls";
import fetchAPI from "@/lib/fetchAPI";
import { getUserFullNameOrEmail } from "@/lib/utils";
import {
  IFetchKeysResponse,
  IKeyStore,
  IKeyStoreActions,
  INITIAL_KEYS_STORE_DATA
} from "@/store/types/keys";

export const useKeysStore = create<IKeyStore & IKeyStoreActions>((set, get) => ({
  ...INITIAL_KEYS_STORE_DATA,
  fetchKeys: async () => {
    const { ok, data, ...rest } = await fetchAPI<IFetchKeysResponse>(
      URL_ROOT_GET_KEYS,
      { method: "GET" },
      { errorToast: { title: "Error fetching keys" } }
    );

    if (ok)
      set({
        keys: data.data || []
      });
    else
      set({
        keys: []
      });

    return { ok, data, ...rest };
  },
  generateKey: async () => {
    const { ok } = await fetchAPI(
      URL_ROOT_GENERATE_KEY,
      { method: "POST" },
      {
        successToast: { title: "New key generated" },
        errorToast: { title: "Error generating key" }
      }
    );

    if (ok) await get().fetchKeys();
  },
  assignUser: async (key, user) => {
    const { ok, ...rest } = await fetchAPI(
      URL_ROOT_ASSIGN_KEY,
      {
        method: "PUT",
        body: JSON.stringify({ keyId: key.keyId, userId: user.userId })
      },
      {
        successToast: { title: `User ${getUserFullNameOrEmail(user)} assigned to key` },
        errorToast: { title: "Error assigning user to key" }
      }
    );

    if (ok) await get().fetchKeys();

    return { ok, ...rest };
  },
  deleteKey: async key => {
    const { ok, ...rest } = await fetchAPI(
      URL_TEMPLATE_ROOT_DELETE_KEY(key.keyId),
      { method: "DELETE" },
      {
        successToast: {
          title: `The key ${Boolean(key.owner) ? "for " + getUserFullNameOrEmail(key.owner) : ""} has been burned. Now a new key can be generated`
        },
        errorToast: { title: "Error deleting key" }
      }
    );

    if (ok) await get().fetchKeys();

    return { ok, ...rest };
  },
  renewKey: async key => {
    const { ok, ...rest } = await fetchAPI(
      URL_TEMPLATE_ROOT_RENEW_KEY(key.keyId),
      { method: "PUT" },
      {
        successToast: { title: "Key renewed" },
        errorToast: { title: "Error renewing key" }
      }
    );

    if (ok) await get().fetchKeys();

    return { ok, ...rest };
  }
}));
