import React from "react";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import TableCardListContent, {
  ITableCardListContentProps
} from "@/components/shared/TableCardList/TableCardListContent";

interface ITableCardListProps<T> extends ITableCardListContentProps<T> {
  page: number;
  setPage: (page: number) => void;
  count: number;
}

const TableCardList = <T extends object>(props: ITableCardListProps<T>) => {
  const {
    page,
    setPage,
    count,
    ...rest
  } = props;

  return (
    <>
      <TableCardListContent {...rest} />
      <PaginationFooter
        page={page}
        setPage={setPage}
        count={count}
        pageSize={rest.pageSize}
      />
    </>
  )
}

export default TableCardList;
