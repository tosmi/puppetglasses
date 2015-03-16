/* exported PuppetglassesNodes */

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
