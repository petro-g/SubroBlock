import { format } from "date-fns";
import Image from "next/image";
import * as React from "react";
import { useEffect, useState } from "react";
import { AvatarUser } from "@/components/shared/avatar";
import { BadgeUserStatus } from "@/components/shared/badge-status";
import {
  useUserActionsLogTableColumnsDef
} from "@/components/shared/SidePanel/Content/UserDetails_PanelContent/useUserTransactionsTableColumnsDef";
import TableCardList from "@/components/shared/TableCardList/TableCardList";
import {
  useTableDataProps
} from "@/components/shared/TableCardList/use-table-data-props";
import { openModal } from "@/components/shared/use-confirmation-modal";
import { Button } from "@/components/ui/button";
import { DATE_FORMAT } from "@/lib/constants/static";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { currentUserHasSomeRoles } from "@/lib/utils";
import DownloadIcon from "@/public/download-icon.svg";
import KeyIcon from "@/public/key-circle-orange.svg";
import RefreshIcon from "@/public/rotate-left.svg";
import TrashIcon from "@/public/trash.svg";
import { IKey } from "@/store/types/keys";
import { useActionsLogStore } from "@/store/useActionsLogStore";
import { useKeysStore } from "@/store/useKeysStore";
import { useUsersStore } from "@/store/useUsersStore";

export default function UserDetails_PanelContent() {
  const {
    selectedUser,
    fetchUserDetails
  } = useUsersStore();

  const {
    fetchActionLogs,
    actionLogs,
    logsTotalCount,
    lastFetchParams
  } = useActionsLogStore();

  const {
    fetchKeys,
    keys,
    renewKey,
    deleteKey
  } = useKeysStore();

  const {
    page,
    setPage,
    pageSize,
    sorting,
    setSorting,
    searchParams,
    loading,
    withLoadingDelayed
  } = useTableDataProps({ lastFetchParams });

  const currentUser = useCurrentUser();
  const [selectedUserKey, setSelectedUserKey] = useState<IKey | undefined>(undefined);

  const isAdmin = currentUserHasSomeRoles(currentUser, ["admin"]);

  useEffect(() => {
    if (!selectedUser) return;
    if (!selectedUser.userId) return;
    if (!currentUser) return;
    fetchUserDetails(currentUser, selectedUser);
  }, [selectedUser?.userId, currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedUser?.userId && currentUser?.roles) {
      withLoadingDelayed(async () => fetchActionLogs(currentUser, selectedUser, searchParams));
      setPage(1);
    }
  }, [searchParams, currentUser?.roles, selectedUser?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (keys)
      setSelectedUserKey(keys.find((key) => key.owner?.userId === selectedUser?.userId));
    else if (selectedUser?.hasKeyAssigned)
      fetchKeys();
  }, [keys, selectedUser?.hasKeyAssigned]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = useUserActionsLogTableColumnsDef({ sorting, setSorting });

  if (!selectedUser) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AvatarUser
            size="xl"
            colorScheme="currentUser"
            user={selectedUser}
          />
          <div className="flex flex-col gap-2 items-start">
            <BadgeUserStatus
              className="w-fit"
              user={selectedUser}
            />
            <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
          </div>
        </div>
        <Button variant="ghost">
          <Image
            src={DownloadIcon}
            alt="SubroBlock DownloadIcon"
            className="mr-2"
          />
          Download
        </Button>
      </div>

      {selectedUserKey && !loading && (
        <div
          className="bg-accent rounded border border-accent-muted p-4 gap-2.5 flex">
          <Image
            src={KeyIcon}
            alt="SubroBlock KeyIcon"
            width={40}
            height={40}
          />
          <div>
            <p className="text-primary-foreground font-medium mb-0.5">
              The user has a key
            </p>
            <p>
              Generated: {" "}
              <span className="text-base text-primary-foreground">
                {format(selectedUserKey.createdAt || 0, DATE_FORMAT)}
              </span>
            </p>
          </div>
          {!isAdmin && (
            <div className="ml-auto flex gap-2 items-center">
              <Button
                variant="link"
                className="gap-1.5"
                onClick={() => openModal({
                  title: "Renew Key",
                  description: "Are you sure you want to renew this key?",
                  onConfirm: () => withLoadingDelayed(async () => renewKey(selectedUserKey))
                })}
              >
                <Image
                  src={RefreshIcon}
                  alt="RefreshIcon"
                />
                Renew Key
              </Button>
              <Button
                variant="link"
                className="text-destructive gap-1.5"
                onClick={() => openModal({
                  title: "Burn Key",
                  description: "Are you sure you want to burn this key?",
                  onConfirm: () => withLoadingDelayed(async () => deleteKey(selectedUserKey))
                })}
              >
                <Image
                  src={TrashIcon}
                  alt="TrashIcon"
                />
                Burn Key
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h3>User Details</h3>
        <div className="flex flex-row gap-x-10 gap-y-2 flex-wrap">
          <div>
            <span>Email</span>
            <p className="text-primary-foreground mt-1">
              {selectedUser.email}
            </p>
          </div>
          <div>
            <span>Date Created</span>
            <p className="text-primary-foreground mt-1">
              {format(selectedUser.createdAt || 0, DATE_FORMAT)}
            </p>
          </div>
          <div>
            <span>Last Login</span>
            <p className="text-primary-foreground mt-1">
              {selectedUser.loggedAt ? format(selectedUser.loggedAt, DATE_FORMAT) : "N/A"}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-x-10 gap-y-2 flex-wrap">
              <div>
                <span>Organization Name</span>
                <p className="text-primary-foreground mt-1">
                  {selectedUser.organization?.name || "N/A"}
                </p>
              </div>
              <div>
                <span>Root User Email</span>
                <p className="text-primary-foreground mt-1">
                  {selectedUser.organization?.rootUserEmail || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3>Actions Log</h3>
        <TableCardList
          title="Action Logs"
          data={actionLogs}
          columns={columns}
          loading={loading}
          pageSize={pageSize}
          rowProps={{
            className: "cursor-pointer"
          }}
          page={page}
          count={logsTotalCount}
          setPage={setPage}
        />
      </div>
    </div>
  );
}
