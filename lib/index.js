const  KnexQueryBuilder = require('knex/lib/query/builder');

module.exports.attachOnDuplicateUpdate = function attachOnDuplicateUpdate() {
  KnexQueryBuilder.prototype.onDuplicateUpdate = function(...columns) {
    if (this._method !== 'insert') {
      throw new Error('onDuplicateUpdate error: should be used only with insert query.');
    }

    if (columns.length === 0) {
      throw new Error('onDuplicateUpdate error: please specify at least one column name.');
    }

    const columnsPlaceHolders = columns.map(() => `??=Values(??)`).join(', ');

    return this.client.raw(
      `${this.toString()} on duplicate key update ${columnsPlaceHolders}`,
      columns.reduce((bindings, column) => bindings.concat([column, column]), [])
    );
  };
}
