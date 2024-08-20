import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChevronLeft from "@/public/chevron-left.svg";
import ChevronRight from "@/public/chevron-right.svg";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("flex", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
    HTMLUListElement,
    React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
    isActive?: boolean,
    isPrev?: boolean;
    isNext?: boolean;
} & Pick<ButtonProps, "size"> &
    React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isPrev,
  isNext,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive && !isPrev && !isNext ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive && !isPrev && !isNext ? "outline" : "ghost",
        size
      }),
      `text-popover-foreground cursor-pointer text-xs bg-transparent rounded-full ${isActive && !isPrev && !isNext ? "rounded-full bg-accent-muted text-accent-foreground w-5 h-5" : ""}`,
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    isPrev
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <div className="flex justify-center items-center rounded-full bg-background border-primary/[.12] border border-solid w-7 h-7">
      <Image
        src={ChevronLeft}
        alt="Info"
      />
    </div>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    isNext
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <div
      className="flex justify-center items-center rounded-full bg-background border-primary/[.12] border border-solid w-7 h-7">
      <Image
        src={ChevronRight}
        alt="Info"
      />
    </div>
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
};
