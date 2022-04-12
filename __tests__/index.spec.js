const knex = require('knex');
const dotenv = require('dotenv');
const { attachOnDuplicateUpdate } = require('../lib/index');

attachOnDuplicateUpdate();

if (process.env.CI !== 'true') {
  dotenv.config('../.env');
}

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
});

function getById(id) {
  return db('persons').where({ id }).first();
}

describe('onDuplicateUpdate', () => {
  beforeAll(() => db('persons').truncate());

  afterAll(() => db.destroy());

  describe('validation', () => {
    it('should throw if applied to none insert query', () => {
      expect(() => db('persons').select('id').onDuplicateUpdate('')).toThrowError(
        'onDuplicateUpdate error: should be used only with insert query.'
      );
    });

    it('should throw if no columns given', () => {
      expect(() =>
        db.insert({ id: 1, name: 'test' }).into('persons').onDuplicateUpdate()
      ).toThrowError('onDuplicateUpdate error: please specify at least one column name.');
    });
    it('should throw if columns are not string or object', () => {
      expect(() =>
        db.insert({ id: 1, name: 'test' }).into('persons').onDuplicateUpdate(false)
      ).toThrowError('onDuplicateUpdate error: expected column name to be string or object.');
    });
    it('should throw if insert is empty array', () => {
      expect(() => db.insert([]).into('persons').onDuplicateUpdate('whatever')).toThrowError(
        'onDuplicateUpdate error: empty insert statement.'
      );
    });
  });

  describe('behaviour', () => {
    it('should allow insert new row', async () => {
      const person = { id: 2, name: 'test' };
      await db.insert(person).into('persons').onDuplicateUpdate('name');
      const insertPerson = await getById(2);
      expect(insertPerson).toEqual(expect.objectContaining(person));
    });

    it('should update on duplicate', async () => {
      await db.insert({ id: 3, name: 'test3' }).into('persons');
      await db.insert({ id: 3, name: 'test33' }).into('persons').onDuplicateUpdate('name');
      const person = await getById(3);

      expect(person.name).toBe('test33');
    });

    it('should allow updating multiple columns', async () => {
      const id = 4;
      await db.insert({ id, name: 'test4', email: '1@1.com' }).into('persons');
      await db
        .insert({
          id,
          name: 'test5',
          email: '5@5.com',
        })
        .into('persons')
        .onDuplicateUpdate('name', 'email');
      const person = await getById(id);

      expect(person).toEqual(expect.objectContaining({ name: 'test5', email: '5@5.com' }));
    });

    it('should allow specifying a value for a column when updating multiple', async () => {
      const id = 5;
      await db.insert({ id, name: 'test6', email: '6@6.com' }).into('persons');
      await db
        .insert({
          id,
          name: 'test6',
          email: '6@6.com',
        })
        .into('persons')
        .onDuplicateUpdate({ email: 'updated-email', name: 'update-name' });

      const person = await getById(id);
      expect(person).toEqual(
        expect.objectContaining({
          name: 'update-name',
          email: 'updated-email',
        })
      );
    });

    it('should allow specifying a value for a column when updating multiple and mix types', async () => {
      const id = 6;
      await db.insert({ id, name: 'test6', email: '6@6.com' }).into('persons');
      await db
        .insert({
          id,
          name: 'test6',
          email: '6@6.com',
        })
        .into('persons')
        .onDuplicateUpdate({ email: 'updated-email' }, 'name');

      const person = await getById(id);
      expect(person).toEqual(
        expect.objectContaining({
          name: 'test6',
          email: 'updated-email',
        })
      );
    });

    it('should correctly escape field with ? character', async () => {
      await db.insert({ id: 7, name: 'other value' }).into('persons');
      await db.insert({ id: 7, name: '?' }).into('persons').onDuplicateUpdate('name');
      const person = await getById(7);

      expect(person.name).toBe('?');
    });

    it('should accepts any valid value in object form', async () => {
      await db
        .insert({ id: 7, name: 'other value' })
        .into('persons')
        .onDuplicateUpdate({ name: 2, email: db.raw('?', ['raw@test.com']) });
      const person = await getById(7);

      expect(person.name).toBe('2');
      expect(person.email).toBe('raw@test.com');
    });
  });
});
