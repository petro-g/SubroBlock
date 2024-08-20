import { ColumnSort } from "@tanstack/table-core";
import SortFilterDownIcon from "@/public/sort-filter-down.svg";
import SortFilterUpIcon from "@/public/sort-filter-up.svg";
import SortFilterIcon from "@/public/sort-filter.svg";

export const getSortingIcon = (id: string, sorting?: ColumnSort) => {
  if (sorting?.id === id)
    return sorting.desc ? SortFilterDownIcon : SortFilterUpIcon;

  return SortFilterIcon;
}

export const handleSortingClick = (id: string, props?: { sorting?: ColumnSort, setSorting?: (sortBy: ColumnSort) => void }) => () => {
  if (props?.sorting?.id === id && !props?.sorting?.desc)
    props?.setSorting?.({ id: "", desc: false });
  else
    props?.setSorting?.({ id, desc: !props.sorting?.desc });
}
