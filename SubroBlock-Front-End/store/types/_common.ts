export interface IFetchPaginationParams {
  pageSize: number;       // always sent to API
  page: number;           // always sent to API

  // don't send to API if empty, might cause unexpected behavior
  sort: string | "";      // not sent if empty
  order: "asc" | "desc";  // not sent if sort empty
  search: string | "";    // not sent if empty
}
