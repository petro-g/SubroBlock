import { X } from "lucide-react";
import React from "react";
import {
  SheetClose,
  SheetHeader
} from "@/components/ui/sheet";
import { useSidePanelStore } from "@/store/useSidePanelStore";

interface RightSidePanelHeader {
  title: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

export const SidebarHeader: React.FC<RightSidePanelHeader> = ({
  title,
  onClose,
  children
}) => {
  const { setOpenPanel } = useSidePanelStore();
  return (
    <SheetHeader className="border-b">
      <div className="text-lg font-semibold text-primary flex justify-start items-center p-6">
        <div onClick={() => setOpenPanel(null)}>
          <SheetClose
            className="flex rounded-full p-1 absolute w-10 h-10 -left-14 top-4 bg-secondary-foreground items-center justify-center"
            onClick={onClose}
          >
            <X className="h-6 w-6 text-background" />
          </SheetClose>
        </div>
        <h2 className="mr-2.5">{title}</h2>
        {children && (
          <div className="flex justify-end ml-auto">
            {children}
          </div>
        )}
      </div>
    </SheetHeader>
  );
};
