import React from "react";
import { Skeleton } from "@/components/ui/skeleton"
import "@/pages/globals.css";

/**
 * Primary UI component for user interaction
 */
export const SkeletonDefault = () => {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full"/>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]"/>
        <Skeleton className="h-4 w-[200px]"/>
      </div>
    </div>
  );
};

