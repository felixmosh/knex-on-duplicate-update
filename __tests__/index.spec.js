const knex = require('knex');
const dotenv = require('dotenv');
const { attachOnDuplicateUpdate } = require('../lib/index');

attachOnDuplicateUpdate();

if (process.env.IS_CI !== 'true') {
  dotenv.config('../.env');
}

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  }
});


function getById(id) {
  return db('persons').where({ id }).first();
}

describe('onDuplicateUpdate', () => {
  beforeAll(() => db('persons').truncate());

  afterAll(() => db.destroy());

  describe('validation', () => {
    it('should throw if applied to none insert query', () => {
      expect(() => db('persons').select('id').onDuplicateUpdate(''))
        .toThrowError('onDuplicateUpdate error: should be used only with insert query.');
    });

    it('should throw if no columns given', () => {
      expect(() => db.insert({ id: 1, name: 'test' }).into('persons').onDuplicateUpdate())
        .toThrowError('onDuplicateUpdate error: please specify at least one column name.');
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
      await db.insert({
        id,
        name: 'test5',
        email: '5@5.com'
      }).into('persons').onDuplicateUpdate('name', 'email');
      const person = await getById(id);

      expect(person).toEqual(expect.objectContaining({ name: 'test5', email: '5@5.com' }));
    });
  });
});
