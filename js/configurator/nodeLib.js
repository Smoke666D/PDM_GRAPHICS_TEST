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
    return;
  }
  this.getNodeRecord = function ( id ) {
    return this.records[id];
  }
  return;
}


var nodeLib = new NodeLib();

/*----------------------------------------------------------------------------*/
module.exports.nodeLib = nodeLib;
/*----------------------------------------------------------------------------*/
