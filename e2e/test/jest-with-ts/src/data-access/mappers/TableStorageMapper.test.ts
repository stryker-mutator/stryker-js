import { Constants, TableQuery } from 'azure-storage';
import TableStorageMapper from './TableStorageMapper';
import * as TableServiceAsPromisedModule from '../services/TableServiceAsPromised';
import { StorageError } from '../../../test/helpers/StorageError';
import { DashboardQuery } from './DashboardQuery';
import { Result } from './Mapper';
import { OptimisticConcurrencyError } from '../errors';

jest.mock('../services/TableServiceAsPromised');

export class FooModel {
  public partitionId: string;
  public rowId: string;
  public bar: number;

  public static createPartitionKey(entity: Pick<FooModel, 'partitionId'>): string {
    return entity.partitionId;
  }
  public static createRowKey(entity: Pick<FooModel, 'rowId'>): string | undefined {
    return entity.rowId;
  }
  public static identify(entity: FooModel, partitionKeyValue: string, rowKeyValue: string): void {
    entity.partitionId = partitionKeyValue;
    entity.rowId = rowKeyValue;
  }
  public static readonly persistedFields = ['bar'] as const;
  public static readonly tableName = 'FooTable';
}

describe(TableStorageMapper.name, () => {
  const TableServiceAsPromisedModuleMocked = TableServiceAsPromisedModule as typeof import('../services/__mocks__/TableServiceAsPromised');
  const TableService = TableServiceAsPromisedModuleMocked.default;

  class TestHelper {
    public sut = new TableStorageMapper(FooModel); // this will mock the TableService because of Jest's black magic!
  }
  let helper: TestHelper;

  beforeEach(() => {
    helper = new TestHelper();
    TableService.mockClear();
  });

  describe('createTableIfNotExists', () => {
    it('should create table "FooTable"', async () => {
      TableServiceAsPromisedModuleMocked.createTableIfNotExistsMock.mockResolvedValueOnce({});
      await helper.sut.createStorageIfNotExists();
      expect(TableServiceAsPromisedModuleMocked.createTableIfNotExistsMock).toHaveBeenCalledWith('FooTable');
    });
  });

  describe('insertOrMerge', () => {
    it('should insert the given model', async () => {
      const expected: FooModel = {
        partitionId: 'github/owner',
        rowId: 'name',
        bar: 42
      };
      TableServiceAsPromisedModuleMocked.insertOrMergeEntityMock.mockResolvedValue({});
      await helper.sut.insertOrMerge(expected);
      expect(TableServiceAsPromisedModuleMocked.insertOrMergeEntityMock).toHaveBeenCalledWith('FooTable', {
        PartitionKey: 'github;owner',
        RowKey: 'name',
        bar: 42,
        ['.metadata']: {}
      });
      expect(expected.bar).toEqual(42);
    });
  });

  describe('findOne', () => {
    it('should retrieve the entity from storage', async () => {
      const result = createEntity();
      TableServiceAsPromisedModuleMocked.retrieveEntityMock.mockResolvedValue(result);
      await helper.sut.findOne({ partitionId: 'github/partKey', rowId: 'row/key' });
      expect(TableServiceAsPromisedModuleMocked.retrieveEntityMock).toHaveBeenCalledWith('FooTable', 'github;partKey', 'row;key');
    });

    it('should return null if it resulted in a 404', async () => {
      const error = new StorageError(Constants.StorageErrorCodeStrings.RESOURCE_NOT_FOUND);
      TableServiceAsPromisedModuleMocked.retrieveEntityMock.mockRejectedValue(error);
      const actualProject = await helper.sut.findOne({ partitionId: 'github/partKey', rowId: 'rowKey' });
      expect(actualProject).toEqual(null);
    });

    it('should return the entity', async () => {
      const expected: FooModel = { rowId: 'rowKey', partitionId: 'partKey', bar: 42 };
      TableServiceAsPromisedModuleMocked.retrieveEntityMock.mockResolvedValue(createEntity(expected, 'etagValue'));
      const actualProjects = await helper.sut.findOne({ partitionId: 'github/partKey', rowId: 'rowKey' });
      expect(actualProjects).toEqual({ model: expected, etag: 'etagValue' });
    });
  });

  describe('findAll', () => {
    it('should query the underlying storage', async () => {
      const expectedQuery = new TableQuery().where('PartitionKey eq ?', 'github;partKey');
      TableServiceAsPromisedModuleMocked.queryEntitiesMock.mockResolvedValue({ entries: [] });
      await helper.sut.findAll(DashboardQuery.create(FooModel)
        .wherePartitionKeyEquals({ partitionId: 'github/partKey' })
      );
      expect(TableServiceAsPromisedModuleMocked.queryEntitiesMock).toHaveBeenCalledWith('FooTable', expectedQuery, undefined);
    });

    it('should return the all entities', async () => {
      const expectedEntities: FooModel[] = [
        { rowId: 'rowKey', partitionId: 'partKey', bar: 142 },
        { rowId: 'rowKey2', partitionId: 'partKey2', bar: 25 }
      ];
      TableServiceAsPromisedModuleMocked.queryEntitiesMock.mockResolvedValue({ entries: expectedEntities.map(entity => createEntity(entity)) });
      const actualProjects = await helper.sut.findAll(DashboardQuery.create(FooModel)
        .wherePartitionKeyEquals({ partitionId: 'github/partKey' })
      );
      expect(actualProjects).toEqual(expectedEntities.map(model => ({ model, etag: 'foo-etag' })));
    });
  });

  describe('replace', () => {
    it('should replace entity with given etag', async () => {
      TableServiceAsPromisedModuleMocked.replaceEntityMock.mockResolvedValue({ ['.metadata']: { etag: 'next-etag' } });
      const expected: FooModel = { bar: 42, partitionId: 'partId', rowId: 'rowId' };
      const expectedResult: Result<FooModel> = { model: expected, etag: 'next-etag' };
      const result = await helper.sut.replace(expected, 'prev-etag');
      expect(result).toEqual(expectedResult);
      const expectedEntity = createRawEntity(expected, 'prev-etag');
      expect(TableServiceAsPromisedModuleMocked.replaceEntityMock).toHaveBeenCalledWith(FooModel.tableName, expectedEntity, {});
    });

    it('should throw a OptimisticConcurrencyError if the UPDATE_CONDITION_NOT_SATISFIED is thrown', async () => {
      TableServiceAsPromisedModuleMocked.replaceEntityMock.mockRejectedValue(new StorageError(Constants.StorageErrorCodeStrings.UPDATE_CONDITION_NOT_SATISFIED));
      await expect(helper.sut.replace({ bar: 24, partitionId: 'part', rowId: 'row' }, 'prev-etag')).rejects.toBeInstanceOf(OptimisticConcurrencyError);
    });
  });

  describe('insert', () => {
    it('should insert entity', async () => {
      TableServiceAsPromisedModuleMocked.insertEntityMock.mockResolvedValue({ ['.metadata']: { etag: 'next-etag' } });
      const expected: FooModel = { bar: 42, partitionId: 'partId', rowId: 'rowId' };
      const expectedResult: Result<FooModel> = { model: expected, etag: 'next-etag' };
      const result = await helper.sut.insert(expected);
      expect(result).toEqual(expectedResult);
      expect(TableServiceAsPromisedModuleMocked.insertEntityMock).toHaveBeenCalledWith(FooModel.tableName, createRawEntity(expected), {});
    });

    it('should throw an OptimisticConcurrencyError if the entity already exists', async () => {
      TableServiceAsPromisedModuleMocked.insertEntityMock.mockRejectedValue(new StorageError(Constants.TableErrorCodeStrings.ENTITY_ALREADY_EXISTS));
      await expect(helper.sut.insert({ bar: 24, partitionId: 'part', rowId: 'row' })).rejects.toBeInstanceOf(OptimisticConcurrencyError);
    });
  });

  function createRawEntity(overrides?: Partial<FooModel>, etag?: string) {
    const foo: FooModel = {
      bar: 42,
      partitionId: 'partKey',
      rowId: 'rowKey',
      ...overrides
    };
    function metadata() {
      if (etag) {
        return {
          etag
        };
      } else {
        return {};
      }
    }
    return {
      PartitionKey: foo.partitionId,
      RowKey: foo.rowId,
      bar: foo.bar,
      ['.metadata']: metadata()
    };
  }

  function createEntity(overrides?: Partial<FooModel>, etag = 'foo-etag'): TableServiceAsPromisedModule.Entity<FooModel, 'partitionId' | 'rowId'> {
    const foo: FooModel = {
      bar: 42,
      partitionId: 'partKey',
      rowId: 'rowKey',
      ...overrides
    };
    return {
      PartitionKey: { _: foo.partitionId, $: 'Edm.String' },
      RowKey: { _: foo.rowId, $: 'Edm.String' },
      bar: { _: foo.bar, $: 'Edm.Int32' },
      ['.metadata']: {
        etag
      }
    };
  }

});
