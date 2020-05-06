import { TableQuery } from 'azure-storage';
import { ModelClass } from '../services/ModelClass';
import { encodeKey } from '../utils';

interface WhereCondition {
  condition: string;
  params: unknown[];
}

export class DashboardQuery<TModel, TPartitionKeyFields extends keyof TModel, TRowKeyFields extends keyof TModel> {
  private constructor(protected ModelClass: ModelClass<TModel, TPartitionKeyFields, TRowKeyFields>, private readonly whereConditions: WhereCondition[]) { }

  public whereRowKeyNotEquals(rowKey: Pick<TModel, TRowKeyFields>): DashboardQuery<TModel, TPartitionKeyFields, TRowKeyFields> {
    const whereCondition: WhereCondition = { condition: 'not(RowKey eq ?)', params: [encodeKey(this.ModelClass.createRowKey(rowKey) || '')] };
    return new DashboardQuery(this.ModelClass, [...this.whereConditions, whereCondition]);
  }

  public wherePartitionKeyEquals(partitionKey: Pick<TModel, TPartitionKeyFields>): DashboardQuery<TModel, TPartitionKeyFields, TRowKeyFields> {
    const whereCondition: WhereCondition = { condition: 'PartitionKey eq ?', params: [encodeKey(this.ModelClass.createPartitionKey(partitionKey))] };
    return new DashboardQuery(this.ModelClass, [...this.whereConditions, whereCondition]);
  }

  public static create<TModel, TPartitionKeyFields extends keyof TModel, TRowKeyFields extends keyof TModel>(ModelClass: ModelClass<TModel, TPartitionKeyFields, TRowKeyFields>): DashboardQuery<TModel, TPartitionKeyFields, TRowKeyFields> {
    return new DashboardQuery(ModelClass, []);
  }

  public build(): TableQuery {
    return this.whereConditions.reduce((tableQuery, whereCondition, index) => {
      if (index === 0) {
        return tableQuery.where(whereCondition.condition, ...whereCondition.params);
      } else {
        return tableQuery.and(whereCondition.condition, whereCondition.params);
      }
    }, new TableQuery());
  }
}
