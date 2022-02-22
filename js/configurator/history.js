/*----------------------------------------------------------------------------*/
const op = {
  cmd = {
    'add' : 0, /* Add */
    'del' : 1, /* Delete */
    'mov' : 2, /* Move */
    'opt' : 3, /* Change options */
  },
  typ = {
    'node' : 0,
    'link' : 1,
    'adr'  : 2
  }
}
/*----------------------------------------------------------------------------*/
function Coords ( x = 0, y = 0 ) {
  this.x = x;
  this.y = y;
  return;
}
function Operation () {
  var self = this;
  
  this.id  = 0;
  this.cmd = op.cmd.add;
  this.typ = op.typ.node;
  this.cor = new Coords();
  
  return;
}
function History () {
  var self = this;

  this.size       = 0;
  this.opreations = [];

  this.add   = function ( operation ) {
    self.opreations.push( operation );
    return;
  }
  this.clean = function () {
    self.opreations.length = 0;
    return;
  }

  return;
}
/*----------------------------------------------------------------------------*/
let history = new History();
/*----------------------------------------------------------------------------*/
module.exports.history = history;