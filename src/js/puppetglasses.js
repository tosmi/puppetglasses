/* globals PuppetglassesNodes: false, PuppetglassesStatistics: false */
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
