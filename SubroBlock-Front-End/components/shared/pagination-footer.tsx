import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface IOfferPagePaginationProps {
  page?: number;
  pageSize?: number;
  count?: number;
  setPage?: (page: number) => void;
}

export const PaginationFooter: React.FC<IOfferPagePaginationProps> = (props) => {
  const {
    page = 1,
    count = 0,
    pageSize = 10,
    setPage
  } = props;

  const pageIndices = [
    page - 3,
    page - 2,
    page - 1,
    page,
    page + 1,
    page + 2,
    page + 3
  ].filter((page) => page > 0) // remove negative pages
    .filter((page) => page <= Math.ceil(count / pageSize)); // remove pages greater than total pages

  const handlePageChange = (newPage: number) => {
    // clamp between 1 and total pages
    newPage = Math.max(1, Math.min(newPage, Math.ceil(count / pageSize)));

    if (newPage !== page)
      setPage?.(newPage);
  }

  if (count === 0) return null;

  return (
    <Pagination className="justify-between items-center">
      <div className="text-primary-foreground text-xs">
        {page * pageSize - pageSize + 1}-
        {Math.min(page * pageSize, count)} of <span className="text-primary">{count} items</span>
      </div>
      <PaginationContent>
        <PaginationItem onClick={() => handlePageChange(page - 1)}>
          <PaginationPrevious/>
        </PaginationItem>
        {pageIndices.map((pageIndex) => (
          <PaginationItem
            key={pageIndex}
            onClick={() => setPage?.(pageIndex)}
          >
            <PaginationLink
              isActive={page === pageIndex}
              className="w-5 h-5"
            >
              {pageIndex}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem onClick={() => handlePageChange(page + 1)}>
          <PaginationNext/>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
