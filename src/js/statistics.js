var PuppetglassesStatistics = (function() {
  var bean = 'com.puppetlabs.puppetdb.query.population:type=default,name=';

  var metrics = {
    "total-nodes": {
      desc: "Total number of nodes",
      value: 0
    },
    "active-nodes": {
      desc: "Number of active nodes",
      value: 0
    },
    "stale-nodes": {
      desc: "Number of stale nodes",
      value: 0
    },
    "num-resources": {
      desc: "Number of resources",
      value: 0
    },
    "avg-resources-per-node": {
      desc: "Average number of resources per nodes",
      value: 0
    },
    "pct-resource-dupes": {
      desc: "Percentage of resource duplications",
      value: 0
    }
  };

  function PuppetglassesStatistics() {
    this.initMetricsTableDone = false;

    this.calculateStatistics = function(data) {
      metrics["total-nodes"].value = data.length;
      for(var node in data) {
	var t1 = new Date();
	var t2 = new Date(data[node].catalog_timestamp);
	if( (t1 - t2) > (1000*60*60) ) {
	  metrics["stale-nodes"].value++;
	}
	else {
	  metrics["active-nodes"].value++;
	}
      }
    };

    this.displayStatistics = function() {
      for(var metric in metrics) {
	var selector = '#' + metric;
	$(selector).text(metrics[metric].value);
      }

      this.updateNodeChart();
    };

    this.updateNodeChart = function() {
      var data = [
	{
          value: metrics["active-nodes"].value,
	  color: "#46BFBD",
	  highlight: "#5AD3D1",
          label: metrics["active-nodes"].desc
	},
	{
          value: metrics["stale-nodes"].value,
	  color:"#F7464A",
          highlight: "#FF5A5E",
          label: metrics["stale-nodes"].desc
	},
      ];

      var ctx = $("#node_chart").get(0).getContext("2d");
      var nodeChart = new Chart(ctx).Doughnut(data);
    };

    this.updateNodeMetrics = function () {
      var uri  = puppetglassesConfig.puppetdb_url +'/nodes';
      var self = this;
      $.get(uri)
	.done(function(data) {
	  self.calculateStatistics(data);
	  self.displayStatistics();
	});
    };

    this.updateMetric = function(metric) {
      var self = this;
      var uri = puppetglassesConfig.puppetdb_url + '/metrics/mbean/' + encodeURIComponent(bean + metric);
      $.get(uri)
	.done(function(data) {
	  metrics[metric].value = data.Value;
	  self.displayStatistics();
	});
    };

    this.initMetricsTable = function() {
      if(this.initMetricsTableDone){
	return;
      }

      for(var metric in metrics) {
	var row = '<tr><td>' + metrics[metric].desc + '</td>';
	row    += '<td id="' + metric + '">' + metrics[metric].value + '</td></tr>';
	$('#statistics_table tbody').append(row);
      }
      this.initMetricsTableDone = true;
    };

    this.resetMetrics = function() {
      for (var metric in metrics) {
	metrics[metric].value = 0;
      }
    };

    this.collect = function () {
      this.updateNodeMetrics();

      this.updateMetric('num-resources');
      this.updateMetric('avg-resources-per-node');
      this.updateMetric('pct-resource-dupes');
    };
  }

  PuppetglassesStatistics.prototype.run = function() {
    this.initMetricsTable();
    this.resetMetrics();
    this.collect();
  };

  return PuppetglassesStatistics;
}());
