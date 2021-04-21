import { knex } from 'knex';
import '../types';

const db = knex({});

(async () => {
  await db('table').insert({ id: 1, name: 'test' }).onDuplicateUpdate('name', 'column2');

  await db('table').insert({ id: 1, name: 'test' }).onDuplicateUpdate({ name: 'new name' }, 'xx');
  await db<{ id: number; name: string }>('table')
    .insert({ id: 1, name: 'test' })
    .onDuplicateUpdate({
      name: db.raw('Concat(name, "_test")'),
    });

  const [{ insertId }] = await db<{ id: number; name: string }>('table')
    .insert({ id: 1, name: 'bla' })
    .onDuplicateUpdate('name', 'id', { name: db.raw('Concat(name, "_test")') });

  const testId = insertId === 1 ? 1 : 0;
})();
