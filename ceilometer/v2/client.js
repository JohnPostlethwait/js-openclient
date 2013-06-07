var base = require("../../client/base"),
    MeterManager = require("./meter");


var Ceilometer = base.Client.extend({
  service_type: "metering",
  version: "1",

  init: function (options) {
    this._super(options);

    this.meters = new MeterManager(this);
  }
});


module.exports = Ceilometer;
