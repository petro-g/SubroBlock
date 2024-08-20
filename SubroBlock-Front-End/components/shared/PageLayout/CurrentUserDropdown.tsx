import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import React from "react";
import { AvatarUser } from "@/components/shared/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useCurrentUser from "@/lib/hooks/useCurrentUser";

const CurrentUserDropdown = () => {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.reload(); // hard reload to be sure page is reloaded
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <AvatarUser
          user={currentUser}
          colorScheme="currentUser"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="py-2">
        <span className="px-6 cursor-default text-primary">
          {currentUser?.email}
        </span>
        <span className="px-6 capitalize cursor-default text-primary">
          {currentUser?.roles?.join(", ")}
        </span>
        <div
          className="cursor-pointer hover:bg-background-secondary py-2 px-6 mt-2"
          onClick={handleLogout}
        >
          Logout
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default CurrentUserDropdown;
