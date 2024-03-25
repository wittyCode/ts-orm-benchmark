export interface SearchConfig<T> {
  searchKeys: T;
  searchValues: T;
  withChildren?: string[];
}

export type SearchConfigType = string | string[];
