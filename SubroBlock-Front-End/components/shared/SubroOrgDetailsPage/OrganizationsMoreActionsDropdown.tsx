import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LockIcon from "@/public/lock.svg";
import PopoverDeleteIcon from "@/public/popover-delete.svg";
import SuspendIcon from "@/public/suspend.svg";
import { IOrganization } from "@/store/types/organization";
import { useOrganizationsStore } from "@/store/useOrganizationsStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import DropdownOptionsMenu from "../DropdownOptionsMenu";

interface IOrganizationsMoreActionsDropdown {
  organizationId: number,
  organizationStatus: IOrganization["status"]
}

const setOrganizationStatusAction = (organizationStatus: IOrganization["status"]): { actionText: string; statusAction: IOrganization["status"] } => {
  if (organizationStatus.toUpperCase() === "ACTIVE") {
    return {
      actionText: "Suspend",
      statusAction: "SUSPENDED"
    }
  }

  return {
    actionText: "Active",
    statusAction: "ACTIVE"
  }
}
export const OrganizationsMoreActionsDropdown: React.FC<IOrganizationsMoreActionsDropdown> = ({
  organizationId,
  organizationStatus
}) => {
  const { setOpenPanel } = useSidePanelStore();
  const { changeStatus } = useOrganizationsStore();
  const { actionText, statusAction } = setOrganizationStatusAction(organizationStatus);
  return (
    <DropdownOptionsMenu
      options={[
        {
          value: "test",
          render: () => (
            <div className="flex flex-col">
              <div className="flex flex-row mb-2 items-center">
                <Image
                  src={LockIcon}
                  alt="LockIcon"
                  className="mr-1.5 w-6 h-6"
                />
                <Button variant="link" className="text-primary" onClick={() => {
                  setOpenPanel("changeOrganizationRootPassword");
                }}>Change Root Password</Button>
              </div>
              <div className="flex flex-row mb-2 items-center">
                <Image
                  src={PopoverDeleteIcon}
                  alt="PopoverDeleteIcon"
                  className="mr-1.5 w-6 h-6"
                />
                <Button variant="link" className="text-primary" onClick={() => {
                  setOpenPanel("changeOrganizationRootPassword");
                }}>Delete</Button>
              </div>
              <div className="flex flex-row mb-2 items-center">
                <Image
                  src={SuspendIcon}
                  alt="SuspendIcon"
                  className="mr-1.5 w-6 h-6"
                />
                <Button variant="link" className="text-primary" onClick={() => {
                  changeStatus(organizationId, statusAction);
                }}>{actionText}</Button>
              </div>
            </div>)
        }
      ]}
    >
      <div className={cn(
        "h-6 w-6 p-0 hover:rounded-full",
        // button and ghost variant styles. because can't put button inside button, causes hydration issues
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        "hover:bg-accent outline-0 hover:text-accent-foreground disabled:bg-background disabled:text-secondary-foreground disabled:hover:bg-background disabled:border-secondary-foreground disabled:opacity-100",
      )}>
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-6 w-6" />
      </div>
    </DropdownOptionsMenu>
  )
};
