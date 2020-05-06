export const createTableIfNotExistsMock = jest.fn();
export const queryEntitiesMock = jest.fn();
export const insertOrMergeEntityMock = jest.fn();
export const retrieveEntityMock = jest.fn();
export const replaceEntityMock = jest.fn();
export const insertEntityMock = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    createTableIfNotExists: createTableIfNotExistsMock,
    queryEntities: queryEntitiesMock,
    insertOrMergeEntity: insertOrMergeEntityMock,
    retrieveEntity: retrieveEntityMock,
    replaceEntity: replaceEntityMock,
    insertEntity: insertEntityMock
  };
});

export default mock;
