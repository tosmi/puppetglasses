/*! Puppetglasses - v0.1.0 - 2015-03-16
* https://github.com/tosmi/puppetglasses
* Copyright (c) 2015 Toni Schmidbauer; Licensed GPLv3 */
window.puppetglassesConfig = {};

puppetglassesConfig.puppetdb_url="http://localhost:2080/v3";
puppetglassesConfig.puppet_run_interval_minutes=30;

/* exported PuppetglassesStatistics */

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
	if( (t1 - t2) >= (1000*60*60) ) {
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
      new Chart(ctx).Doughnut(data);
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

    this.updateMetric = function(metric, multiply) {
      multiply = typeof multiply !== 'undefined' ? multiply : 1;

      var self = this;
      var uri = puppetglassesConfig.puppetdb_url + '/metrics/mbean/' + encodeURIComponent(bean + metric);
      $.get(uri)
	.done(function(data) {
	  metrics[metric].value = Math.floor(data.Value * multiply);
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
      this.updateMetric('pct-resource-dupes', 100);
    };
  }

  PuppetglassesStatistics.prototype.run = function() {
    this.initMetricsTable();
    this.resetMetrics();
    this.collect();
  };

  return PuppetglassesStatistics;
}());

var PuppetglassesNodes = (function() {
  function PuppetglassesNodes() {
    this.nodestable = $('#nodes_table').DataTable({
      "search": {
        "caseInsensitive": false
      }
    });

    this.addRow = function(node, data) {
        this.nodestable.row.add([
          data[node].name,
          data[node].catalog_timestamp,
          data[node].facts_timestamp,
          data[node].deactivated === 'undefined' ? false : true,
        ]);
    };

    this.nodeIsActive = function(last_catalog_update) {
      var tnow = new Date();
      return (tnow - last_catalog_update) < (1000 * 60* puppetglassesConfig.puppet_run_interval_minutes);
    };

    this.displayNodes = function(data, active){
      this.nodestable.clear();

      for(var node in data) {
        var node_active = this.nodeIsActive(new Date(data[node].catalog_timestamp));
        if (active && node_active) {
          this.addRow(node,data);
        }
        else if (!active && !node_active) {
          this.addRow(node,data);
        }
      }
      this.nodestable.search('').columns().search('').draw();
    };

    this.showNodes = function(active) {
      var self = this;
      $.get(puppetglassesConfig.puppetdb_url + '/nodes')
        .done(function(data) {
          self.displayNodes(data, active);
        });
    };
  }


  PuppetglassesNodes.prototype.run = function(active) {
      this.showNodes(active);
  };

  return PuppetglassesNodes;
}());

var Puppetglasses = (function() {
  'use strict';

  function Puppetglasses() {
    this.config = puppetglassesConfig;
    this.statistics = new PuppetglassesStatistics();
    this.nodes = new PuppetglassesNodes();
  }

  Puppetglasses.prototype.findNodes = function(request,response) {
    var uri = this.config.puppetdb_url + '/nodes?query=["~","name","' + request.term +'"]';

    $.getJSON(uri)
      .done(function(data) { parseNodes(data, response); });
  };

  Puppetglasses.prototype.findResources = function() {
    var node = $('#hostname').val();
    var uri  = this.config.puppetdb_url +'/nodes/' + node + '/resources';

    var self = this;
    $.get(uri)
      .done(function(data) { self.displayResources(data); });
  };

  Puppetglasses.prototype.displayResources = function(resources) {
    resourcetable.clear();
    resources.map(addRow);
    resourcetable.search('').columns().search('').draw();
    this.addTooltips();
    $("#resources").show();
  };

  Puppetglasses.prototype.addTooltips = function() {
    resourcetable.column(2).visible(true);
    $('#resource_table tbody tr').each( function() {
      var td = $('td',this)[2];
      var parameters = $(td).text();
      this.setAttribute('title', parameters);
    });
    resourcetable.column(2).visible(false);
  };

  Puppetglasses.prototype.showStatistics = function() {
    var self = this;
    $('#navbar_statistics').addClass('active');
    $('#navbar_resources').removeClass('active');
    $('#navbar_nodes').removeClass('active');
    $("#puppetglasses_resources").hide();
    $("#puppetglasses_nodes").hide();
    $("#puppetglasses_statistics").show(0,
      function() { self.statistics.run(); }
    );
  };

  Puppetglasses.prototype.showResources = function() {
    $('#navbar_statistics').removeClass('active');
    $('#navbar_nodes').removeClass('active');
    $('#navbar_resources').addClass('active');
    $("#puppetglasses_resources").show();
    $("#puppetglasses_statistics").hide();
    $("#puppetglasses_nodes").hide();
  };

  Puppetglasses.prototype.showNodes = function(active) {
    var self = this;
    $('#navbar_statistics').removeClass('active');
    $('#navbar_resources').removeClass('active');
    $('#navbar_nodes').addClass('active');
    $("#puppetglasses_resources").hide();
    $("#puppetglasses_statistics").hide();
    $("#puppetglasses_nodes").show(0,
       function() { self.nodes.run(active); } );
  };

  function parseNodes(data, response) {
    var nodes = [];
    for(var i = 0; i < data.length; i++) {
      nodes.push(data[i].name);
    }
    response(nodes);
  }

  function addRow(resource) {
    resourcetable.row.add([
      resource.type,
      resource.title,
      paramToString(resource.parameters)
    ]);
  }

  function paramToString(param) {
    var str = '';
    for(var p in param) {
      if(param.hasOwnProperty(p)) {
        str += p + '=>' + param[p] + '\n';
      }
    }
    return str;
  }

  var resourcetable = $('#resource_table').DataTable({
    "search": {
      "caseInsensitive": false
    },
    "columnDefs": [
      {
        "targets": 2,
        "searchable": false
      },
    ]
  });

  return Puppetglasses;
}());

$(document).ready(function () {
  var puppetglasses = new Puppetglasses();

  $("#hostname").autocomplete({
    source: function(request,response) { puppetglasses.findNodes(request, response); }
  });
  $("#search").click( function() { puppetglasses.findResources(); });

  $("#navbar_statistics").click( function() { puppetglasses.showStatistics(); });
  $("#navbar_resources").click( function() { puppetglasses.showResources(); });

  $("#navbar_active_nodes").click( function() { puppetglasses.showNodes(true); });
  $("#navbar_stale_nodes").click( function() { puppetglasses.showNodes(false); });

  $("#resources").hide();
  $("#puppetglasses_statistics").hide();
  $('#resource_table').on('draw.dt', function() { puppetglasses.addTooltips(); });
});
