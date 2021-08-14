function NodeRecord () {
  var self = this;
  this.inputs  = [];
  this.outputs = [];
  return;
}

function NodeLib () {
  var self = this;
  this.records = [];

  this.init = function () {
    this.records.push({
      "id"      : 0,
      "inputs"  : ["bool"],
      "outputs" : ["bool"],
      "width"   : 100,
      "height"  : 50,
    });
    return;
  }
  this.getNodeRecord = function ( id ) {
    return this.records[id];
  }

  this.init();
  return;
}


var nodeLib = new NodeLib();

/*----------------------------------------------------------------------------*/
module.exports.nodeLib = nodeLib;
/*----------------------------------------------------------------------------*/
