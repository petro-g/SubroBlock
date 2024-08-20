import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import Folder from "@/public/folder.svg";
import { useSidePanelStore } from "@/store/useSidePanelStore";

export const FilesView_PanelHeader = () => {
  const { setOpenPanel } = useSidePanelStore();

  return (
    <Button
      variant="link"
      onClick={() => setOpenPanel("viewFiles")}
      className="ml-auto"
    >
      <Image
        src={Folder}
        alt="Folder"
        className="mr-2 color-current"
      />
      View Files
    </Button>
  );
};
