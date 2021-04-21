import { Knex } from 'knex';

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder<TRecord extends {} = any, TResult = any> {
      onDuplicateUpdate(
        ...columnNames: Array<
          | Knex.DbRecord<Knex.ResolveTableType<TRecord, 'insert'>>
          | keyof TRecord
        >
      ): Knex.QueryBuilder<TRecord, TResult>;
    }
  }
}

export function attachOnDuplicateUpdate(): void;
