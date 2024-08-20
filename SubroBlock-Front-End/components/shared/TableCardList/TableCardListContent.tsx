import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import TableEmptyContent from "@/components/shared/TableCardList/TableEmptyContent";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { isClickedInsideCurrentTarget } from "@/lib/utils";

export interface ITableCardListContentProps<T> {
  data: T[] | null;
  columns: ColumnDef<T>[];

  title: string;
  onCreateNew?: () => void;
  loading: boolean;
  pageSize: number;
  rowProps?: {
    className?: string;
    onClick?: (row: Row<T>) => void;
  };
}

const TableCardListContent = <T extends object>(props: ITableCardListContentProps<T>) => {
  const {
    data,
    columns,
    title,
    onCreateNew,
    rowProps,
    pageSize = 10,
    loading
  } = props;

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <Table className="w-full border-none mb-2.5">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="gap-1">
        {!loading &&
          data &&
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={rowProps?.className}
              onClick={(e) => isClickedInsideCurrentTarget(e) && rowProps?.onClick?.(row)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        {!loading && data && !data.length && (
          <TableRow>
            <TableCell colSpan={columns.length}>
              <TableEmptyContent title={title} onCreateNew={onCreateNew} />
            </TableCell>
          </TableRow>
        )}
        {(loading || !data) &&
          [...Array(pageSize)].map((_, index) => (
            <TableRow key={index}>
              {columns.map((_, index) => (
                <TableCell key={index}>
                  <Skeleton className="h-10" />
                </TableCell>
              ))}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default TableCardListContent;
