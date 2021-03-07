import { Knex } from 'knex';

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder {
      onDuplicateUpdate(...columnNames: Array<{ [key: string]: string } | string>): Knex.QueryBuilder<any, any>;
    }
  }
}

export function attachOnDuplicateUpdate(): void;
