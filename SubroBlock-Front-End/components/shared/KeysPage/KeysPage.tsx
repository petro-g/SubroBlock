import { format } from "date-fns";
import Image from "next/image";
import React, { useEffect } from "react";
import { AvatarUser } from "@/components/shared/avatar";
import UserAssignModal from "@/components/shared/KeysPage/UserAssignModal";
import {
  useConfirmationModal
} from "@/components/shared/use-confirmation-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DATE_FORMAT } from "@/lib/constants/static";
import useLoading from "@/lib/hooks/useLoading";
import { getUserFullNameOrEmail } from "@/lib/utils";
import KeyIcon from "@/public/key-circle-orange.svg";
import RefreshIcon from "@/public/rotate-left.svg";
import TrashIcon from "@/public/trash.svg";
import { IKey } from "@/store/types/keys";
import { IUser } from "@/store/types/user";
import { useKeysStore } from "@/store/useKeysStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import { useUsersStore } from "@/store/useUsersStore";

export default function KeysPage() {
  const {
    keys,
    fetchKeys,
    generateKey,
    assignUser,
    deleteKey,
    renewKey
  } = useKeysStore();

  const { openModal } = useConfirmationModal();

  const {
    setSelectedUser
  } = useUsersStore();

  const { setOpenPanel } = useSidePanelStore();
  const [ loading, withLoading ] = useLoading();
  const [ loadingKey, withLoadingKey ] = useLoading();

  useEffect(() => {
    withLoading(async () => fetchKeys());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-5">
        <Button variant="outline">
          Download Key Data
        </Button>
        <Button variant="outline">
          Download Key History
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {new Array(3).fill(0).map((_, index) => {
          if (loading || !keys) {
            return (
              <Skeleton
                key={index}
                className="bg-background p-6 rounded flex flex-col gap-4 items-center justify-center text-center h-64 text-sm text-secondary-foreground"
              >
                loading...
              </Skeleton>
            );
          }

          const key = keys[index] as IKey | undefined;

          if (!key) {
            return (
              <div
                key={index}
                className="bg-background p-6 rounded flex flex-col gap-4 items-center justify-center text-center"
              >
                <Image
                  src={KeyIcon}
                  alt="SubroBlock KeyIcon"
                  width={48}
                  height={48}
                />
                <h3>SubroKey {index} hasn’t been generated yet</h3>
                <div className="flex gap-2 items-center w-full">
                  <Button
                    className="w-full"
                    onClick={() => withLoadingKey(async () => generateKey())}
                    disabled={loadingKey}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={index}
              className="bg-background py-6 rounded flex flex-col gap-6"
            >
              <div className="flex gap-2 px-6">
                <Image
                  src={KeyIcon}
                  alt="SubroBlock KeyIcon"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col gap-1">
                  <h3>
                    {key.keyName}
                  </h3>
                  <span className="text-secondary-foreground">Generated: <span
                    className="text-primary-foreground">{format(key.createdAt || 0, DATE_FORMAT)}</span></span>
                </div>
              </div>
              <div className="w-full border-t border-border" />
              {key.owner ? (
                <div className="flex gap-2 items-center w-full px-6">
                  <div>
                    <AvatarUser
                      user={{
                        ...key.owner,
                        hasKeyAssigned: true
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-secondary-foreground">{key.owner?.role}</span>
                    <p className="text-primary-foreground font-medium">
                      {key.owner?.firstName && key.owner?.lastName
                        ? `${key.owner?.firstName} ${key.owner?.lastName}`
                        : key.owner?.email
                      }
                    </p>
                  </div>
                  <Button
                    variant="link"
                    className="ml-auto"
                    onClick={() => {
                      setSelectedUser({ userId: key.owner?.userId } as unknown as IUser); // user details page will fetch id to get user details
                      setOpenPanel("userDetails");
                    }}
                  >
                    View Details
                  </Button>
                </div>
              ) : (
                <div className="px-6 flex gap-2 items-center my-auto">
                  <UserAssignModal onUserAssign={user => assignUser(key, user)}>
                    <Button
                      className="w-full"
                      disabled={loadingKey}
                    >
                      Assign Key for User
                    </Button>
                  </UserAssignModal>
                </div>
              )}
              <div className="w-full border-t border-border mt-auto" />
              <div className="flex justify-between w-full px-6 items-center">
                <Button
                  variant="link"
                  className="text-destructive gap-1.5"
                  disabled={loadingKey}
                  onClick={() => openModal({
                    title: "Burn Key",
                    description: `This action will burn the key ${Boolean(key.owner) ? "for " + getUserFullNameOrEmail(key.owner) : ""} and will not create a new key`,
                    onConfirm: () => withLoadingKey(async () => deleteKey(key))
                  })}
                >
                  <Image
                    src={TrashIcon}
                    alt="TrashIcon"
                  />
                  Burn Key
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  disabled={loadingKey || !key.owner}
                  onClick={() => openModal({
                    title: "Renew Key",
                    description: "Are you sure you want to renew this key?",
                    onConfirm: () => withLoadingKey(async () => renewKey(key))
                  })}
                >
                  <Image
                    src={RefreshIcon}
                    alt="RefreshIcon"
                  />
                  Renew Key
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
