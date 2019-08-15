const KnexQueryBuilder = require('knex/lib/query/builder');

module.exports.attachOnDuplicateUpdate = function attachOnDuplicateUpdate() {
  KnexQueryBuilder.prototype.onDuplicateUpdate = function (...columns) {
    if (this._method !== 'insert') {
      throw new Error('onDuplicateUpdate error: should be used only with insert query.');
    }

    if (columns.length === 0) {
      throw new Error('onDuplicateUpdate error: please specify at least one column name.');
    }

    const columnsPlaceHolders = columns.map((column) => {
      if (typeof column === 'string') {
        return `??=Values(??)`;
      }
      if (column && typeof column === 'object') {
        return Object.keys(column).map(() => `??=?`).join(', ');
      }
      throw new Error('onDuplicateUpdate error: expected column name to be string or object.');
    }).join(', ');

    const binds = columns.reduce((bindings, column) => {
      if (typeof column === 'string') {
        return bindings.concat([column, column]);
      }
      if (column && typeof column === 'object') {
        const objectColumns = Object.keys(column).map((col) => {
          return [col, column[col]];
        });
        return bindings.concat(...objectColumns);
      }
      throw new Error('onDuplicateUpdate error: expected column name to be string or object.');
    }, []);

    return this.client.raw(
      `${this.toString()} on duplicate key update ${columnsPlaceHolders}`,
      binds
    );
  };
};
