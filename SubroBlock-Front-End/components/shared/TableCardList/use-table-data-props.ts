import { ColumnSort } from "@tanstack/table-core";
import { useMemo, useState } from "react";
import useDelay from "@/lib/hooks/useDelay";
import useLoading from "@/lib/hooks/useLoading";
import { IFetchPaginationParams } from "@/store/types/_common";

interface ITableCardListProps {
  lastFetchParams: Pick<IFetchPaginationParams, "search">;
}

// hook to manage pagination, sorting and search, and loading state
export const useTableDataProps = ({ lastFetchParams }: ITableCardListProps) => {
  const pageSize = 10; // later make it dynamic
  const [page, setPage] = useState<number>(1);

  const [sorting, setSorting] = useState<ColumnSort>({ id: "", desc: false });
  const [searchValue, setSearchValue] = useState<string>("");

  const { delay } = useDelay();
  const [loading, withLoading] = useLoading();

  const searchParams = useMemo(() => {
    const params = {
      page,
      pageSize
    } as IFetchPaginationParams;

    if (sorting.id) {
      params.sort = sorting.id;
      params.order = sorting.desc ? "desc" : "asc";
    }

    if (searchValue) {
      params.search = searchValue;
    }

    return params;
  }, [page, searchValue, sorting.desc, sorting.id]) as IFetchPaginationParams;

  // debounce search. waits for user to stop typing then fetch
  const withLoadingDelayed = (fn: () => Promise<unknown>) => {
    const delayMs = lastFetchParams?.search === searchParams.search || loading ? 0 : 1000; // debounce search
    delay(() => withLoading(async () => fn()), delayMs);
  }

  return {
    pageSize,
    page,
    setPage,
    sorting,
    setSorting,
    searchValue,
    setSearchValue,

    searchParams,

    loading,
    withLoadingDelayed
  };
}
