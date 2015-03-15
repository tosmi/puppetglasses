/*! Puppetglasses - v0.1.0 - 2015-03-15
* https://github.com/tosmi/puppetglasses
* Copyright (c) 2015 Toni Schmidbauer; Licensed GPLv3 */
window.puppetglassesConfig = {};

puppetglassesConfig.puppetdb_url="http://localhost:2080/v3";

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

var Puppetglasses = (function() {
  'use strict';

  function Puppetglasses() {
    this.config = puppetglassesConfig;
    this.statistics = new PuppetglassesStatistics();
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
    $('#navbar_statistics').toggleClass('active');
    $('#navbar_resources').toggleClass('active');
    $("#puppetglasses_resources").hide();
    $("#puppetglasses_statistics").show(0,
      function() { self.statistics.run(); }
    );
  };

  Puppetglasses.prototype.showResources = function() {
    $('#navbar_statistics').toggleClass('active');
    $('#navbar_resources').toggleClass('active');
    $("#puppetglasses_resources").show();
    $("#puppetglasses_statistics").hide();
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

  $("#resources").hide();
  $("#puppetglasses_statistics").hide();
  $('#resource_table').on('draw.dt', function() { puppetglasses.addTooltips(); });
});
