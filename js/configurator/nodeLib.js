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
      "name"    : "node_varBool",
      "table"   : 0,
      "help"    : "Булевая переменная",
      "inputs"  : [
        {
          "type"   : "bool",
          "help"   : "Запись переменной",
          "expand" : false
        }
      ],
      "outputs" : [
        {
          "type"   : "bool",
          "help"   : "Чтение переменной",
          "expand" : false
        }
      ],
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
