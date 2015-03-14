(function () {
  'use strict';

  function paramToString(param) {
    var str = '';
    for(var p in param) {
      if(param.hasOwnProperty(p)) {
	str += p + '=>' + param[p] + '\n';
      }
    }
    return str;
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

  function displayResources(resources) {
    $("#resources").show();
    resourcetable.clear();
    for(var i = 0; i < resources.length; i++) {
      resourcetable.row.add([
	resources[i].type,
	resources[i].title,
	paramToString(resources[i].parameters)
      ]).draw();
    }
    addTooltips();
    resourcetable.search('').columns().search('').draw();
  }

  function findResources() {
    var node = $('#hostname').val();
    var uri = puppetglassesConfig.puppetdb_url +'/nodes/' + node + '/resources';

    $("#data_table").remove();

    $.get(uri)
      .done(displayResources);
  }

  function parseNodes(data, response) {
    var nodes = [];
    for(var i = 0; i < data.length; i++) {
      nodes.push(data[i].name);
    }

    response(nodes);
  }

  function findNodes(request, response) {
    var uri = puppetglassesConfig.puppetdb_url + '/nodes?query=["~","name","' + request.term +'"]';

    $.getJSON(uri)
      .done(function(data) { parseNodes(data, response); });
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

  $('#resource_table').on('draw.dt', addTooltips);

  $("#resources").hide();

  $("#search").click(findResources);

  $("#hostname").autocomplete({
    source: findNodes
  });

}());
