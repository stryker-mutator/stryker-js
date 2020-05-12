export interface ModelClass<TModel, TPartitionKeyFields extends keyof TModel, TRowKeyFields extends keyof TModel> {
  new(): TModel;
  createPartitionKey(entity: Pick<TModel, TPartitionKeyFields>): string;
  createRowKey(entity: Pick<TModel, TRowKeyFields>): string | undefined;
  identify(entity: Partial<TModel>, partitionKeyValue: string, rowKeyValue: string): void;
  readonly persistedFields: ReadonlyArray<Exclude<keyof TModel, TRowKeyFields>>;
  readonly tableName: string;
}
