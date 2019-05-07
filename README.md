# Knex-onDuplicateUpdate

Simple patcher for Knex. It adds the .onDuplicateUpdate() function to knex's query builder.

## How to set up

To use this lib, first you will have to install it:

```
npm i knex-on-duplicate-update --save
```

Then, add the following lines to your Knex set up:

```javascript
const knex = require('knex')(config);

const {attachOnDuplicateUpdate} = require('knex-on-duplicate-update');
attachOnDuplicateUpdate();
```

## Function definition

```javascript
onDuplicateUpdate(...columns: string[]): Knex.QueryBuilder
```

## How to use

### Example
```javascript
await knex.insert({id: 1, name: 'John', email: 'john@mail.com'})
    .into('persons')
    .onDuplicateUpdate('name', 'email');
```

This lib got inspiration from [`knex-paginator`]https://github.com/cannblw/knex-paginator).
