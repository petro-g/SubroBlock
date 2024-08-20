import React from "react";

export interface IRightSidePanel {
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    headerChildren?: React.ReactNode;
    children: React.ReactNode;
}
