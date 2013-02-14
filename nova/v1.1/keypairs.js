var base = require("../../client/base"),
    error = require("../../client/error");


var KeypairManager = base.Manager.extend({
  namespace: "os-keypairs",
  plural: "keypairs",
  singular: "keypair",

  // Keypairs don't return their ID via the API, so we use the name instead.
  all: function (params, callback) {
    var manager = this;
    params.parseResult = function (result) {
      var modified_results = [];
      result.forEach(function (item) {
        // The keypairs list call returns an extra layer of wrapping around
        // each keypair which we need to remove.
        var modified_item = item[manager.singular];
        modified_item.id = modified_item.name;
        modified_results.push(modified_item);
      });
      return modified_results;
    };
    return this._super(params, callback);
  },
  create: function (params, callback) {
    params.parseResult = function (result) {
      result.id = result.name;
      return result;
    };
    return this._super(params, callback);
  },

  get: function (params) { throw new error.NotImplemented(); },
  update: function (params) { throw new error.NotImplemented(); }
});


module.exports = KeypairManager;
