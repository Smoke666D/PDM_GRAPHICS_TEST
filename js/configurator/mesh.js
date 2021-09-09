/*----------------------------------------------------------------------------*/
var contentBox = document.getElementById( "mesh" );
/*----------------------------------------------------------------------------*/
const freeSpaceSize = 32;
const cellWidth     = 39;
const cellHeight    = 64;
const xSize         = 100;
const ySize         = 50;
/*----------------------------------------------------------------------------*/
function Cell ( x, y, id, object ) {
  var self = this;
  this.x   = x;
  this.y   = y;
  this.id  = id;
  this.obj = object;
}
function Mesh ( xS, yS ) {
  var self   = this;
  this.xS    = xS;
  this.yS    = yS;
  this.cells = [];

  function clean () {
    contentBox.innerHTML = '';
    self.cells = [];
    return;
  }
  function draw () {
    let h      = freeSpaceSize;
    let w      = 0;
    let c      = 0;
    clean();
    for ( i=0; i<self.yS; i++ ) {
      self.cells.push( new Array() );
      for ( j=0; j<self.xS; j++ ) {
        let cell = document.createElement( "DIV" );
        cell.className  = "meshCell";
        if ( j == 0 ) {
          cell.className += " left";
        }
        cell.id = "cell" + c;
        cell.style.top  = h + "px";
        cell.style.left = w + "px";
        c++;
        w += cellWidth;
        contentBox.appendChild( cell );
        self.cells[i].push( new Cell( j, i, c, cell ) );
      }
      w = 0;
      h += cellHeight + freeSpaceSize;
    }
    return;
  }
  function init () {
    draw();
    return;
  }

  this.getBaseHeight = function () {
    return cellHeight;
  }
  this.getBaseWidth  = function () {
    return cellWidth;
  }

  init();
  return;
}
/*----------------------------------------------------------------------------*/
let mesh = new Mesh( xSize, ySize );
/*----------------------------------------------------------------------------*/
