import { QueryBuilder as KnexQB } from 'knex';

declare module 'knex' {
  interface QueryBuilder {
    onDuplicateUpdate(...columnNames: Array<{[key: string]: string} | string>): KnexQB;
  }
}

export function attachOnDuplicateUpdate(): void;
