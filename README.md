# Knex-onDuplicateUpdate

[![npm](https://img.shields.io/npm/v/knex-on-duplicate-update.svg)](https://www.npmjs.com/package/knex-on-duplicate-update)
[![CircleCI](https://circleci.com/gh/felixmosh/knex-on-duplicate-update.svg?style=svg)](https://circleci.com/gh/felixmosh/knex-on-duplicate-update)

Simple patcher for Knex. It adds the .onDuplicateUpdate() function to knex's query builder in order to add support **MySQL**'s `on duplicate key update columnName=Values(columnName)`.

## Note
`Knex` (v0.21.10) added an official [`upsert`](http://knexjs.org/#Builder-onConflict) functionality with similar capabilities which has support in MySQL, Postgress & SQLite.

## How to set up

To use this lib, first you will have to install it:

```
npm i knex-on-duplicate-update --save
```
or
```
yarn add knex-on-duplicate-update
```

Then, add the following lines to your Knex set up:

```javascript
const knex = require('knex')(config);

const {attachOnDuplicateUpdate} = require('knex-on-duplicate-update');
attachOnDuplicateUpdate();
```

## Function definition

```javascript
onDuplicateUpdate(...columns: Array<{[key: string]: string} | string>): Knex.QueryBuilder
```

## How to use

### Example
```javascript
await knex.insert({id: 1, name: 'John', email: 'john@mail.com'})
    .into('persons')
    .onDuplicateUpdate('name', 'email');
```

Setting a fallback value for a column
```javascript
await knex.insert({id: 1, name: 'John', email: 'john@mail.com'})
    .into('persons')
    .onDuplicateUpdate('name', {email: 'john-exists@mail.com'});
```


This lib got inspiration from [`knex-paginator`](https://github.com/cannblw/knex-paginator).
