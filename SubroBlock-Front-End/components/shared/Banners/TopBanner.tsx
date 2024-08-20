import Image from "next/image";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";
import FillCheckMark from "@/public/fill-check-mark.svg";
const TopBanner =  () => {
  return (
    <div className="w-full h-10 bg-primary-foreground absolute z-10 flex justify-center text-accent items-center">
      <Image src={FillCheckMark} alt="check" className="mr-2" />
      <div className="font-medium mr-1">New Update!</div>
      Lorem ipsum dolor sit amet consectetur. Fringilla
      <Link
        href={""}
        className={cn("cursor-pointer relative text-accent-foreground ml-2")}
      >
        Link 2
      </Link>
    </div>
  );
};
export default TopBanner;
