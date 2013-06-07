var async = require('async'),
    base = require("../../client/base"),
    error = require("../../client/error");


var MeterManager = base.Manager.extend({
  namespace: "meters",


  // get: function (meter_name) {
  //   this.type_name = meter_name;
  // },


  // Gauge meters are discrete items (floating IPs, # image uploads) as well as
  // fluctuating values, such as disk I/O.
  getGauge: {
    Compute: {
      cpu: function () {
        this.type_name = 'cpu_util';
      },

      diskEphemeralSize: function () {
        this.type_name = 'disk.ephemeral.size';
      },

      diskRootSize: function () {
        this.type_name = 'disk.root.size';
      },

      instance: function () {
        this.type_name = 'instance';
      },

      instanceByType: function (openstack_type) {
        this.type_name = 'instance:' + openstack_type;
      },

      memory: function () {
        this.type_name = 'memory';
      },

      vcpus: function () {
        this.type_name = 'vcpus';
      }
    }
  },


  // Cumulative meters are ones that increase over time.
  getCumulative: {
    Compute: {
      cpu: function () {
        this.type_name = 'cpu';
      },

      diskReadBytes: function () {
        this.type_name = 'disk.read.bytes';
      },

      diskReadRequests: function () {
        this.type_name = 'disk.read.request';
      },

      diskWriteBytes: function () {
        this.type_name = 'disk.write.bytes';
      },

      diskWriteRequests: function () {
        this.type_name = 'disk.write.request';
      },

      networkIncomingBytes: function () {
        this.type_name = 'network.incoming.bytes';
      },

      networkIncomingPackets: function () {
        this.type_name = 'network.incoming.packets';
      },

      networkOutgoingBytes: function () {
        this.type_name = 'network.outgoing.bytes';
      },

      networkOutgoingPackets: function () {
        this.type_name = 'network.outgoing.packets';
      }
    }
  }

});


module.exports = MeterManager;
