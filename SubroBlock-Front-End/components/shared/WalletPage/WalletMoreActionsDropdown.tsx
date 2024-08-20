import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";
import DownloadIcon from "@/public/download.svg";
import DropdownOptionsMenu from "../DropdownOptionsMenu";

export const WalletMoreActionsDropdown = () => {
  return (
    <DropdownOptionsMenu
      options={[
        {
          value: "test",
          render: () => (<>
            <Image
              src={DownloadIcon}
              alt="Date of offer"
              className="mr-1.5 w-6 h-6"
            />
            Hello
          </>)
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
