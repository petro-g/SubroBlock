import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const ArrowBackLink = ({ href = "", onClick }: { href?: string; onClick?: () => void; }) => {
  return (
    <Button
      className="flex justify-center items-center gap-1 absolute top-5 left-5 z-20 text-primary"
      variant="link"
    >
      <Link
        href={href}
        onClick={onClick}
        className="flex flex-nowrap items-center gap-1"
      >
        <ChevronLeft size={20} />
          Back
      </Link>
    </Button>
  );
};

export default ArrowBackLink;
