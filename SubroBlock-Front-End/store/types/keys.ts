import { ResponseAPI } from "@/lib/fetchAPI";
import { IUser, TUserRole } from "@/store/types/user";

export interface IFetchKeysResponse {
  data: IKey[];
}

export interface IKey {
  keyId: number;
  keyName: string;
  createdAt: string;
  owner: Pick<IUser, "userId" | "email" | "firstName" | "lastName"> & { role: TUserRole } | null;
}

export interface IKeyStore {
  keys: IKey[] | null;
}

export interface IKeyStoreActions {
  fetchKeys: () => Promise<ResponseAPI<IFetchKeysResponse>>;
  generateKey: () => Promise<void>;
  assignUser: (key: Pick<IKey, "keyId">, user: IUser) => Promise<ResponseAPI>;
  deleteKey: (key: Pick<IKey, "keyId" | "owner">) => Promise<ResponseAPI>;
  renewKey: (key: Pick<IKey, "keyId">) => Promise<ResponseAPI>;
}

export const INITIAL_KEYS_STORE_DATA: IKeyStore = {
  keys: null
};
