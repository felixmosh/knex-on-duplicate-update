const Knex = require('knex');

module.exports.attachOnDuplicateUpdate = function attachOnDuplicateUpdate() {
  Knex.QueryBuilder.extend('onDuplicateUpdate', function onDuplicateUpdate(...columns) {
    if (this._method !== 'insert') {
      throw new Error('onDuplicateUpdate error: should be used only with insert query.');
    }

    if (columns.length === 0) {
      throw new Error('onDuplicateUpdate error: please specify at least one column name.');
    }

    const { placeholders, bindings } = columns.reduce(
      (result, column) => {
        if (typeof column === 'string') {
          result.placeholders.push(`??=Values(??)`);
          result.bindings.push(column, column);
        } else if (column && typeof column === 'object') {
          Object.keys(column).forEach((key) => {
            result.placeholders.push(`??=?`);
            result.bindings.push(key, column[key]);
          });
        } else {
          throw new Error('onDuplicateUpdate error: expected column name to be string or object.');
        }

        return result;
      },
      { placeholders: [], bindings: [] }
    );

    const { sql: originalSQL, bindings: originalBindings } = this.toSQL();

    if (!originalBindings.length) {
      throw new Error('onDuplicateUpdate error: empty insert statement.');
    }

    const newBindings = [...originalBindings, ...bindings];

    return this.client.raw(
      `${originalSQL} on duplicate key update ${placeholders.join(', ')}`,
      newBindings
    );
  });
};
