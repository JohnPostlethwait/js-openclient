var base = require("../../client/base"),
    error = require("../../client/error");

// TODO(roland): Make methods throw NotImplemented where applicable.

var FloatingIPBulkManager = base.Manager.extend({
  namespace: "os-floating-ips-bulk",
  plural: "floating_ip_info",
  singular: "floating_ip"
});


var FloatingIPManager = base.Manager.extend({
  namespace: "os-floating-ips",
  plural: "floating_ips",

  available: function (params, callback) {
    params.parseResult = function (ips) {
      var available = [];
      ips.forEach(function (ip) {
        if (!ip.instance_id) available.push(ip);
      });
      return available;
    };
    return this.all(params, callback);
  },

  add_to_instance: function (params, callback) {
    var client = this.client;
    params.id = params.id || params.data.id;
    if (params.data && params.data.id) delete params.data.id;
    return this.get({
      id: params.id,
      success: function (ip) {
        params.id = params.data.instance_id;
        params.data.address = ip.ip;
        delete params.data.instance_id;
        return client.servers.add_floating_ip(params);
      },
      error: params.error
    }, callback);
  },

  remove_from_instance: function (params, callback) {
    var client = this.client;
    params.data = params.data || {};
    params.id = params.id || params.data.id;
    if (params.data.id) delete params.data.id;
    return this.get({
      id: params.id,
      success: function (ip) {
        params.id = ip.instance_id;
        params.data.address = ip.ip;
        return client.servers.remove_floating_ip(params);
      },
      error: params.error
    }, callback);
  },

  in_use: function (params, callback) {
    params.parseResult = function (result) {
      var in_use = [];
      result.forEach(function (ip) {
        if (ip.project_id) in_use.push(ip);
      });
      return in_use;
    };

    new FloatingIPBulkManager(this.client).all(params, callback);
  },

  _rpc_to_api: function (rpc) {
    // DO NOT USE, this notification is incomplete.
    var api = {};
    //api.id = // OH YEAH, THEY FORGOT TO SEND THE ID.
    api.ip = rpc.floating_ip;
    return rpc;
  }
});


module.exports = FloatingIPManager;
