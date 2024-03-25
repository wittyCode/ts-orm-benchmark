import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as customersSchema from '../schema/customers';
import { SearchConfig, SearchConfigType } from './interfaces';
import { eq } from 'drizzle-orm';
import { TimestampedEntity } from '../../benchmark-data/model/timestamped.entity';

export function runTypedSearchQuery<T>(
  drizzle: NodePgDatabase<typeof customersSchema>,
  params?: SearchConfig<SearchConfigType>,
): Promise<T> {
  return executeTyped<T>(drizzle, findBySearchConfigUntyped, params);
}

// idea: use options object in function param "searchConfig" and let searchValueParam be string | string[]
// - if string[] then spread searchValueParam from options into function call => ...searchConfig.searchValues
// there would also need to be logic for "AND" and "OR" conditions
// maybe something here can be improved by using the arguments object inside the function
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
// TODO extract typeof customersSchema to second generic type to abstract this from customersSchema
function executeTyped<T>(
  drizzle: NodePgDatabase<typeof customersSchema>,
  fn: (
    drizzle: NodePgDatabase<typeof customersSchema>,
    searchValueParam: SearchConfig<SearchConfigType>,
  ) => Promise<{
    [x: string]: any;
  }>,
  searchConfig: SearchConfig<SearchConfigType>,
): Promise<T> {
  return fn(drizzle, searchConfig) as Promise<T>;
}

// TODO: when time, implement for multiple search keys (e.g. start with AND)
function findBySearchConfigUntyped(
  drizzle: NodePgDatabase<typeof customersSchema>,
  searchConfig: SearchConfig<string>,
) {
  const searchKey = searchConfig.searchKeys;
  const searchValues = searchConfig.searchValues;
  const childrenConfig = searchConfig.withChildren?.reduce((map, child) => {
    {
      map[child] = true;
      return map;
    }
  }, {});
  return drizzle.query.customers
    .findFirst({
      where: eq(customersSchema.customers[searchKey], searchValues),
      with: childrenConfig,
    })
    .execute();
}

export function updatedEntity(entity: TimestampedEntity): TimestampedEntity {
  return {
    ...entity,
    updatedAtUtc: new Date(),
  };
}
