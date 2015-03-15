var PuppetglassesStatistics = (function() {

  function PuppetglassesStatistics() {
    this.total_nodes = 0;
    this.active_nodes = 0;
    this.stale_nodes = 0;

    this.collect = function () {
      var uri  = puppetglassesConfig.puppetdb_url +'/nodes';
      var self = this;
      $.get(uri)
	.done(function(data) { self.calculateStatistics(data); });
    };

    this.calculateStatistics = function(data) {
      this.total_nodes = data.length;
      this.displayStatistics();
    };

    this.displayStatistics = function() {
      $('#total_nodes').text(this.total_nodes);
    };
  }

  PuppetglassesStatistics.prototype.run = function() {
    this.collect();

  };

  return PuppetglassesStatistics;
}());
