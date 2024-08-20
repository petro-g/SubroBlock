import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import FileIcon from "@/public/file-orange.svg";

const TableEmptyContent: React.FC<{
  title: string;
  onCreateNew?: () => void;
}> = ({ title, onCreateNew }) => {
  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="bg-background h-20 w-20 flex justify-center border-[0.5px] rounded-full">
          <Image src={FileIcon} alt="FileIcon" />
        </div>
        <div className="text-xl mt-8">You don’t have any {title}</div>
        {onCreateNew && (
          <Button
            className="mt-8 border-warning"
            onClick={onCreateNew}
          >
            Create {title}
          </Button>
        )}
      </div>
    </div>
  );
};
export default TableEmptyContent;
