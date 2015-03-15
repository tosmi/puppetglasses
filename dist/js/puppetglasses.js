/*! Puppetglasses - v0.1.0 - 2015-03-15
* https://github.com/tosmi/puppetglasses
* Copyright (c) 2015 Toni Schmidbauer; Licensed GPLv3 */
window.puppetglassesConfig = {};

puppetglassesConfig.puppetdb_url="http://localhost:2080/v3";

(function () {
  'use strict';

  function findNodes(request, response) {
    var uri = puppetglassesConfig.puppetdb_url + '/nodes?query=["~","name","' + request.term +'"]';

    $.getJSON(uri)
      .done(function(data) { parseNodes(data, response); });
  }

  function parseNodes(data, response) {
    var nodes = [];
    for(var i = 0; i < data.length; i++) {
      nodes.push(data[i].name);
    }
    response(nodes);
  }

  function addTooltips() {
    resourcetable.column(2).visible(true);
    $('#resource_table tbody tr').each( function() {
      var td = $('td',this)[2];
      var parameters = $(td).text();
      this.setAttribute('title', parameters);
    });
    resourcetable.column(2).visible(false);
  }

  function findResources() {
    var node = $('#hostname').val();
    var uri = puppetglassesConfig.puppetdb_url +'/nodes/' + node + '/resources';

    $.get(uri)
      .done(displayResources);
  }

  function displayResources(resources) {
    resourcetable.clear();
    for(var i = 0; i < resources.length; i++) {
      resourcetable.row.add([
        resources[i].type,
        resources[i].title,
        paramToString(resources[i].parameters)
      ]);
    }
    resourcetable.search('').columns().search('').draw();
    addTooltips();
    $("#resources").show();
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

  $("#hostname").autocomplete({
    source: findNodes
  });
  $("#search").click(findResources);
  $("#resources").hide();
  $('#resource_table').on('draw.dt', addTooltips);

}());
