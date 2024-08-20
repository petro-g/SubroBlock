// custom input search
import Image from "next/image";
import React from "react";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CloseCrossCircle from "@/public/close-cross-circle.svg";
import Search from "@/public/search.svg";

export interface ISearchProps extends Omit<InputProps, "value" | "onChange"> {
  value: string; // required
  onChange: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void; // required, event is optional
}

const InputSearch = React.forwardRef<HTMLInputElement, ISearchProps>(({ className, onChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Image
        src={Search}
        alt="Search"
        className="absolute top-1/2 -mt-2 left-3 w-4 h-4 pointer-events-none"
      />
      <Input
        placeholder="Search"
        className="py-2.5 pl-10 text-sm leading-5 w-full box-border"
        ref={ref}
        {...props}
        onChange={handleChange}
      />
      {props.value && (
        <Image
          src={CloseCrossCircle}
          alt="Close"
          className="absolute top-1/2 -mt-2 right-3 w-4 h-4 cursor-pointer"
          onClick={() => onChange?.("")}
        />
      )}
    </div>
  );
});

InputSearch.displayName = "SearchInput";

export { InputSearch };
