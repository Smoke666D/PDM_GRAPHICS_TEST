/*----------------------------------------------------------------------------*/
var contentBox = document.getElementById( "mesh" );
/*----------------------------------------------------------------------------*/
const freeSpaceSize = 32;
const cellWidth     = 39;
const cellHeight    = 64;
const xSize         = 100;
const ySize         = 50;
/*----------------------------------------------------------------------------*/
function Coords ( x=0, y=0 ) {
  this.x = x;
  this.y = y;
  return;
}
function Borders ( left=0, right=0, top=0, bottom=0 ) {
  this.left   = left;
  this.right  = right;
  this.top    = top;
  this.bottom = bottom;
  return;
}
function Cell ( x, y, id, object, onHoverCallback ) {
  var self = this;
  var x   = x;
  var y   = y;
  var id  = id;
  var obj = object;

  this.getBorders  = function () {
    return new Borders(
      obj.offsetLeft,
      ( obj.offsetLeft + obj.offsetWidth ),
      obj.offsetTop,
      ( obj.offsetTop + obj.offsetHeight )
    );
  }
  this.getPosition = function () {
    return new Coords( obj.offsetLeft, obj.offsetTop );
  }

  return;
}
function Shadow () {
  var self = this;
  var obj  = null;

  function init () {
    obj              = document.createElement( 'DIV' );
    obj.className    = 'nodeShadow';
    self.resize( cellHeight, cellWidth );
    self.move( 0, 0 );
    contentBox.appendChild( obj );
    return;
  }

  this.move   = function ( x, y ) {
    obj.style.left = x + "px";
    obj.style.top  = y + "px";
    return;
  }
  this.resize = function ( height, width ) {
    obj.style.height = height + "px";
    obj.style.width  = width + "px";
    return;
  }
  this.show   = function () {
    obj.classList.remove( 'hide' );
    return;
  }
  this.hide   = function () {
    obj.classList.add( 'hide' );
    return;
  }

  init();
  return;
}
function Mesh ( xS, yS ) {
  var self   = this;
  var size   = new Coords( xS, yS );
  var cells  = [];                   /* first array - row (y), second - x*/
  var shadow = null;
  /*--------------------------------------------------*/
  function clean () {
    contentBox.innerHTML = '';
    cells = [];
    return;
  }
  function coordsToAbs ( x, y ) {
    return new Coords(
      ( x * cellWidth ),
      ( ( y * ( freeSpaceSize + cellHeight ) ) + freeSpaceSize )
    );
  }
  function onHover ( x, y ) {
    cur.x = x;
    cur.y = y;
    abs   = coordsToAbs( x, y );
    shadow.move( abs.x, abs.y );
    return;
  }
  function draw () {
    let h      = freeSpaceSize;
    let w      = 0;
    let c      = 0;
    clean();
    for ( i=0; i<size.y; i++ ) {
      cells.push( new Array() );
      for ( j=0; j<size.x; j++ ) {
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
        cells[i].push( new Cell( j, i, c, cell, onHover ) );
      }
      w = 0;
      h += cellHeight + freeSpaceSize;
    }
    shadow = new Shadow();
    shadow.move( 0, freeSpaceSize );
    shadow.hide();
    return;
  }
  function init () {
    abs = coordsToAbs( 0, 0 );
    draw();
    return;
  }
  /*--------------------------------------------------*/
  this.getBaseHeight = function () {
    return cellHeight;
  }
  this.getBaseWidth  = function () {
    return cellWidth;
  }
  this.getWidth      = function () {
    return size.x;
  }
  this.getHight      = function () {
    return size.y;
  }
  this.setShadow     = function ( height, width ) {
    shadow.resize( height, width );
    shadow.show();
    return;
  }
  this.moveShadow    = function ( x, y ) {
    let cord = coordsToAbs( x, y );
    shadow.move( cord.x, cord.y );
    return;
  }
  this.hideShadow    = function () {
    shadow.hide();
    return;
  }
  this.getPosition   = function ( x, y ) {
    return cells[y][x].getPosition();
  }
  this.getBorders    = function ( x, y ) {
    let borders = cells[y][x].getBorders();
    let rect    = contentBox.getBoundingClientRect();
    borders.left   += rect.x;
    borders.right  += rect.x;
    borders.top    += rect.y - freeSpaceSize;
    borders.bottom += rect.y + freeSpaceSize;
    return borders;
  }
  /*--------------------------------------------------*/
  init();
  self.getBorders( 0, 0 );
  return;
}
/*----------------------------------------------------------------------------*/
let mesh = new Mesh( xSize, ySize );
/*----------------------------------------------------------------------------*/
