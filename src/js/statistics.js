var PuppetglassesStatistics = (function() {

  function PuppetglassesStatistics() {
    this.total_nodes = 0;
    this.active_nodes = 0;
    this.stale_nodes = 0;
    this.num_resources = 0;

    this.collect = function () {
      var uri  = puppetglassesConfig.puppetdb_url +'/nodes';
      var self = this;
      $.get(uri)
	.done(function(data) { self.calculateStatistics(data); });

      uri = puppetglassesConfig.puppetdb_url + '/metrics/mbean/' + encodeURIComponent('com.puppetlabs.puppetdb.query.population:type=default,name=num-resources');
      $.get(uri)
	.done(function(data) { self.numResources(data); });
    };

    this.numResources = function(data) {
      this.num_resources = data.Value;
      this.displayStatistics();
    };

    this.calculateStatistics = function(data) {
      this.total_nodes = data.length;
      this.displayStatistics();
    };

    this.displayStatistics = function() {
      $('#total_nodes').text(this.total_nodes);
      $('#num_resources').text(this.num_resources);
    };
  }

  PuppetglassesStatistics.prototype.run = function() {
    this.collect();

  };

  return PuppetglassesStatistics;
}());
