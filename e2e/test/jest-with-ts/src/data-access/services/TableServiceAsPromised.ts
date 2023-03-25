import { promisify } from 'util';
import { TableService, TableQuery, createTableService, common } from 'azure-storage';

export type Entity<T, TKeyFields extends keyof T> = {
  [K in Exclude<keyof T, TKeyFields>]: {
    $: string;
    _: T[K];
  };
} & EntityKey & EntityMetadata;

export interface EntityKey {
  PartitionKey: {
    $: 'Edm.String';
    _: string;
  };
  RowKey: {
    $: 'Edm.String';
    _: string;
  };
}

export interface EntityMetadata {
  ['.metadata']: {
    etag: string;
  };
}

export default class TableServiceAsPromised {

  constructor(tableService = createTableService()) {
    this.createTableIfNotExists = promisify(tableService.createTableIfNotExists).bind(tableService);
    this.queryEntities = promisify(tableService.queryEntities).bind(tableService) as any;
    this.insertOrMergeEntity = promisify(tableService.insertOrMergeEntity).bind(tableService);
    this.retrieveEntity = promisify(tableService.retrieveEntity).bind(tableService) as <TResult> (table: string, partitionKey: string, rowKey: string, options?: TableService.TableEntityRequestOptions) => Promise<TResult>;
    this.replaceEntity = promisify(tableService.replaceEntity).bind(tableService);
    this.insertEntity = promisify(tableService.insertEntity).bind(tableService);
  }

  public insertEntity: (table: string, entityDescriptor: unknown, options: common.RequestOptions) => Promise<TableService.EntityMetadata>;
  public replaceEntity: (table: string, entityDescriptor: unknown, options: common.RequestOptions) => Promise<TableService.EntityMetadata>;
  public createTableIfNotExists: (name: string) => Promise<TableService.TableResult>;
  public queryEntities: <T, Keys extends keyof T>(table: string, tableQuery: TableQuery, cancellationToken: TableService.TableContinuationToken | undefined) => Promise<TableService.QueryEntitiesResult<Entity<T, Keys> & EntityKey>>;
  public insertOrMergeEntity: (table: string, entity: any) => Promise<TableService.EntityMetadata>;
  public retrieveEntity: <TResult> (table: string, partitionKey: string, rowKey: string, options?: TableService.TableEntityRequestOptions) => Promise<TResult>;
}
