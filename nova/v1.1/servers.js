var base = require("../../client/base"),
    error = require("../../client/error"),
    urljoin = require("../../client/utils").urljoin;


var ServerManager = base.Manager.extend({
  namespace: "servers",

  get_base_url: function (params) {
    var base_url = this._super(params);
    if (params.detail) {
      base_url = this.urljoin(base_url, 'detail');
    }
    return base_url;
  },

  all: function (params) {
    if (typeof params.detail === "undefined") params.detail = true;
    return this._super(params);
  },

  create: function (params) {
    if (!params.data.name) {
      params.data.name = null;
    }
    if (params.data.security_groups) {
      if (Object.prototype.toString.call(params.data.security_groups) !== '[object Array]') {
        params.data.security_groups = [params.data.security_groups];
      }
      params.data.security_groups = params.data.security_groups.map(function (sg) {
        return {"name": sg};
      });
    }
    return this._super(params);
  },

  security_groups: function (params) {
    var url = urljoin(this.get_base_url(params), params.id || params.data.id, "os-security-groups");
    params.result_key = 'security_groups';
    params = this.prepare_params(params, url, "singular");
    return this.client.get(params) || this;
  },

  attachments: function (params) {
    var url = urljoin(this.get_base_url(params), params.id || params.data.id, "os-volume_attachments");
    params.result_key = 'volumeAttachments';
    params = this.prepare_params(params, url, "singular");
    return this.client.get(params) || this;
  },

  attach: function (params) {
    var url = urljoin(this.get_base_url(params), params.id || params.data.id, "os-volume_attachments");
    params.result_key = 'volumeAttachment';
    params.data.device = params.data.device || null;
    params = this.prepare_params(params, url, "singular");
    params.data.volumeAttachment = params.data.server;
    delete params.data.server;
    return this.client.post(params) || this;
  },

  detach: function (params) {
    var url = urljoin(this.get_base_url(params), params.id || params.data.id, "os-volume_attachments", params.data.volumeId);
    delete params.data;
    params = this.prepare_params(params, url, "singular");
    return this.client.del(params) || this;
  },

  volumes: function (params) {
    var Cinder = require("../../cinder/v1/client");  // Avoid circular imports.

    var cinder = new Cinder(this.client),
        success = params.success;

    params.success = function (results, xhr) {
      var new_params = {
        success: success,
        error: params.error,
        data: {
          ids: []
        }
      };

      results.forEach(function (result) {
        new_params.data.ids.push(result.id);
      });

      cinder.volumes.in_bulk(new_params);
    };

    return this.attachments(params) || this;
  },

  _action: function (params, action, info, callback) {
    var url = urljoin(this.get_base_url(params), params.id || params.data.id, "action");
    if (params.data && params.data.id) delete params.data.id;
    params = this.prepare_params(params, url, "singular");
    params.data[action] = info || null;
    return this.client.post(params, callback) || this;
  },

  reboot: function (params) { return this._action(params, "reboot", {'type': 'HARD'}); },

  migrate: function (params) { return this._action(params, "migrate"); },

  stop: function (params) { return this._action(params, "stop"); },
  start: function (params) { return this._action(params, "start"); },

  pause: function (params) { return this._action(params, "pause"); },
  unpause: function (params) { return this._action(params, "unpause"); },

  lock: function (params) { return this._action(params, "lock"); },
  unlock: function (params) { return this._action(params, "unlock"); },

  suspend: function (params) { return this._action(params, "suspend"); },
  resume: function (params) { return this._action(params, "resume"); },

  rescue: function (params) { return this._action(params, "rescue"); },
  unrescue: function (params) { return this._action(params, "unrescue"); },

  snapshot: function (params) {
    var extra = {name: params.data.name, metadata: {}};
    params.id = params.id || params.data.id;
    params.data = {};
    return this._action(params, "createImage", extra);
  },

  getConsole: function (params) {
    var instance_id = params.id || params.data.id,
        type = params.data.type || "novnc",
        action = type === "spice-html5" ? "os-getSPICEConsole" : "os-getVNCConsole";
    params.result_key = "console";
    params.parseResult = function (result) {
      result.id = instance_id;
      return result;
    };
    return this._action(params, action, {"type": type});
  },

  getLog: function (params) { return this._action(params, "os-getConsoleOutput", {length: params.data.length || 100}); }

  // TODO: Methods implemented by python-novaclient which are not yet implemented here...
  // add_floating_ip
  // remove_floating_ip
  // add_fixed_ip
  // remove_fixed_ip
  // add_security_group
  // remove_security_group
  // resize
  // rebuild
  // confirm_resize
  // revert_resize
  // backup
  // set_meta
  // delete_meta
  // live_migrate
  // reset_state
  // change_password
  // diagnostics
  // actions
});


module.exports = ServerManager;
