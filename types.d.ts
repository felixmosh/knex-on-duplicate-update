import { Knex } from 'knex';

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder<TRecord extends {} = any> {
      onDuplicateUpdate(
        ...columnNames: Array<
          | Knex.DbRecord<Knex.ResolveTableType<TRecord, 'insert'>>
          | keyof TRecord
        >
      ): Knex.QueryBuilder<TRecord, any>;
    }
  }
}

export function attachOnDuplicateUpdate(): void;
