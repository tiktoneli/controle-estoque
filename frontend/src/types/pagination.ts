export interface PageRequest {
  page: number;
  size: number;
  sort?: string[];
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const DEFAULT_PAGE_SIZE = 10;

export const createPageRequest = (
  page: number = 0,
  size: number = DEFAULT_PAGE_SIZE,
  sort?: string[]
): PageRequest => ({
  page,
  size,
  sort
});