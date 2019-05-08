import { QueryBuilder as KnexQB } from 'knex';

declare module 'knex' {
  interface QueryBuilder {
    onDuplicateUpdate(...columnNames: string[]): KnexQB;
  }
}

export function attachOnDuplicateUpdate(): void;
