import React, { useMemo } from "react";
import { SIDE_PANEL_CONTENTS } from "@/lib/constants/side-panel-content";
import { useSidePanelStore } from "@/store/useSidePanelStore";
import { SidePanel } from "./SidePanel";

export default function SidePanelRoot() {
  const {
    open,
    type,
    setOpenPanel
  } = useSidePanelStore();

  const handleOpenChange = (open: boolean) => {
    if (!open)
      setOpenPanel(null);
  };

  // finds the sidebar content based on the type
  // null when nothing found. Sidebar is empty when closing
  const sidebarContent = useMemo(() =>
    SIDE_PANEL_CONTENTS.find((panel) => panel.type === type),
  [type]);

  const Header = sidebarContent?.header || null;
  const Content = sidebarContent?.content || null;

  return (
    <SidePanel
      open={open}
      onOpenChange={handleOpenChange}
      title={sidebarContent?.title || ""}
      headerChildren={Header && <Header />}
    >
      {Content && <Content />}
    </SidePanel>
  );
}
