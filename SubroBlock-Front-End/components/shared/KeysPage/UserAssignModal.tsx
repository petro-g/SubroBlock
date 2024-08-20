import { X } from "lucide-react";
import React from "react";
import { AvatarUser } from "@/components/shared/avatar";
import { InputSearch } from "@/components/shared/input-search";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import {
  useTableDataProps
} from "@/components/shared/TableCardList/use-table-data-props";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponseAPI } from "@/lib/fetchAPI";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import useLoading from "@/lib/hooks/useLoading";
import { IUser } from "@/store/types/user";
import { useUsersStore } from "@/store/useUsersStore";

interface IUserAssignModalProps {
  children: React.ReactNode;
  onUserAssign: (user: IUser) => Promise<ResponseAPI>;
}

export default function UserAssignModal({
  children,
  onUserAssign
}: IUserAssignModalProps) {
  const {
    users,
    fetchUsers,
    count,
    lastFetchParams
  } = useUsersStore();

  const {
    page,
    setPage,
    searchValue,
    setSearchValue,
    searchParams,
    pageSize,
    loading,
    withLoadingDelayed
  } = useTableDataProps({ lastFetchParams });

  const currentUser = useCurrentUser();

  const [open, setOpen] = React.useState(false);
  const [ loadingUser, withLoadingUser ] = useLoading();

  React.useEffect(() => {
    if (currentUser)
      withLoadingDelayed(async () => fetchUsers(currentUser, false, {
        ...searchParams,
        hasKeyAssigned: false // only users without key can get new key
      }));
  }, [currentUser, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
    >
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <h2>Assign key for user</h2>
          <X
            className="cursor-pointer rounded-full p-1 hover:bg-accent w-8 h-8"
            onClick={() => setOpen(false)}
          />
        </AlertDialogHeader>
        <InputSearch
          className="w-full flex my-2"
          value={searchValue}
          onChange={setSearchValue}
        />
        {!loading && users?.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-4 pb-4 border-b border-secondary"
          >
            <AvatarUser user={user} />
            <div className="flex flex-col">
              <p className="text-primary-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm">
                {user.email}
              </p>
            </div>
            <Button
              className="ml-auto"
              variant="outline"
              disabled={loadingUser}
              onClick={() =>
                withLoadingUser(async () =>
                  onUserAssign(user).then(({ ok }) =>
                    ok && setOpen(false))
                )}
            >
              Assign
            </Button>
          </div>
        ))}
        {users?.length === 0 && !loading && (
          <div className="flex justify-center items-center h-96">
            No users found
          </div>
        )}
        {(loading || !users) && (
          <Skeleton className="h-96" />
        )}
        <PaginationFooter
          page={page}
          setPage={setPage}
          count={count}
          pageSize={pageSize}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
