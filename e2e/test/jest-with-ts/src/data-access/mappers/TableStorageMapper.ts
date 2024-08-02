import { Constants } from 'azure-storage';
import TableServiceAsPromised, { Entity } from '../services/TableServiceAsPromised';
import { encodeKey, decodeKey, isStorageError } from '../utils';
import { Mapper, Result } from './Mapper';
import { OptimisticConcurrencyError } from '../errors';
import { ModelClass } from '../services/ModelClass';
import { DashboardQuery } from './DashboardQuery';

export default class TableStorageMapper<TModel extends object, TPartitionKeyFields extends keyof TModel, TRowKeyFields extends keyof TModel>
  implements Mapper<TModel, TPartitionKeyFields, TRowKeyFields> {
  constructor(
    private readonly ModelClass: ModelClass<TModel, TPartitionKeyFields, TRowKeyFields>,
    private readonly tableService: TableServiceAsPromised = new TableServiceAsPromised()) {
  }

  public async createStorageIfNotExists(): Promise<void> {
    await this.tableService.createTableIfNotExists(this.ModelClass.tableName);
  }

  public async insertOrMerge(model: TModel) {
    const entity = this.toEntity(model);
    await this.tableService.insertOrMergeEntity(this.ModelClass.tableName, entity);
  }

  public async findOne(identity: Pick<TModel, TPartitionKeyFields | TRowKeyFields>): Promise<Result<TModel> | null> {
    try {
      const result = await this.tableService.retrieveEntity<Entity<TModel, TPartitionKeyFields | TRowKeyFields>>(
        this.ModelClass.tableName,
        encodeKey(this.ModelClass.createPartitionKey(identity)),
        encodeKey(this.ModelClass.createRowKey(identity) || ''));
      return this.toModel(result);
    } catch (err) {
      if (isStorageError(err) && err.code === Constants.StorageErrorCodeStrings.RESOURCE_NOT_FOUND) {
        return null;
      }
      else {
        // Oops... didn't mean to catch this one
        throw err;
      }
    }
  }

  public async findAll(query: DashboardQuery<TModel, TPartitionKeyFields, TRowKeyFields> = DashboardQuery.create(this.ModelClass)): Promise<Result<TModel>[]> {
    const tableQuery = query.build();
    const results = await this.tableService.queryEntities<TModel, TPartitionKeyFields | TRowKeyFields>(this.ModelClass.tableName, tableQuery, undefined);
    return results.entries.map(entity => this.toModel(entity));
  }

  /**
   * Replace an entity of a specific version (throws error otherwise)
   * @param model The model to replace
   * @param etag The etag (version id)
   * @throws {OptimisticConcurrencyError}
   */
  public async replace(model: TModel, etag: string): Promise<Result<TModel>> {
    const entity = this.toEntity(model);
    entity['.metadata'].etag = etag;
    try {
      const result = await this.tableService.replaceEntity(this.ModelClass.tableName, entity, {});
      return { model, etag: result['.metadata'].etag };
    } catch (err) {
      if (isStorageError(err) && err.code === Constants.StorageErrorCodeStrings.UPDATE_CONDITION_NOT_SATISFIED) {
        throw new OptimisticConcurrencyError(`Replace entity with etag ${etag} resulted in ${Constants.StorageErrorCodeStrings.UPDATE_CONDITION_NOT_SATISFIED}`);
      } else {
        throw err;
      }
    }
  }

  public async insert(model: TModel) {
    const entity = this.toEntity(model);
    try {
      const result = await this.tableService.insertEntity(this.ModelClass.tableName, entity, {});
      return { model, etag: result['.metadata'].etag };
    } catch (err) {
      if (isStorageError(err) && err.code === Constants.TableErrorCodeStrings.ENTITY_ALREADY_EXISTS) {
        throw new OptimisticConcurrencyError(`Trying to insert "${entity.PartitionKey}" "${entity.RowKey}" which already exists (${Constants.TableErrorCodeStrings.ENTITY_ALREADY_EXISTS})`);
      } else {
        throw err;
      }
    }
  }

  private toModel(entity: Entity<TModel, TPartitionKeyFields | TRowKeyFields>): Result<TModel> {
    const value = new this.ModelClass();
    this.ModelClass.identify(value, decodeKey(entity.PartitionKey._), decodeKey(entity.RowKey._));
    this.ModelClass.persistedFields.forEach(field => value[field] = (entity as any)[field]._);
    return {
      etag: entity['.metadata'].etag,
      model: value
    };
  }

  private toEntity(entity: TModel): Entity<TModel, TPartitionKeyFields | TRowKeyFields> {
    const data: any = {
      PartitionKey: encodeKey(this.ModelClass.createPartitionKey(entity)),
      RowKey: encodeKey(this.ModelClass.createRowKey(entity) || ''),
    };
    this.ModelClass.persistedFields.forEach(field => data[field] = entity[field]);
    data['.metadata'] = {};
    return data;
  }
}
