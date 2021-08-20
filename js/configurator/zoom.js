/*----------------------------------------------------------------------------*/
function setZoom ( zoom, el ) {
  transformOrigin = [0, 0];
  el = el || instance.getContainer();
  var p       = ["webkit", "moz", "ms", "o"];
  var s       = "scale(" + zoom + ")";
  var oString = ( transformOrigin[0] * 100) + "% " + ( transformOrigin[1] * 100 ) + "%";
  for ( var i=0; i<p.length; i++ ) {
      el.style[p[i] + "Transform"]       = s;
      el.style[p[i] + "TransformOrigin"] = oString;
  }
  el.style["transform"]       = s;
  el.style["transformOrigin"] = oString;
  return;
}
/*----------------------------------------------------------------------------*/
var   zoomElement = null;
var   zoomCurrent = 1;
var   callback    = null;
const zoomStep    = 0.1;
/*----------------------------------------------------------------------------*/
function zoomProcessing () {
  if ( zoomElement != null ) {
    setZoom( zoomCurrent, zoomElement );
    callback();
  }
}

function zoomInit ( el, cb ) {
  zoomCurrent = 1;
  zoomElement = el;
  callback    = cb;
  zoomProcessing();
  return;
}

function zoomIn () {
  zoomCurrent += zoomStep;
  zoomProcessing();
  return;
}

function zoomOut () {
  zoomCurrent -= zoomStep;
  zoomProcessing();
  return;
}

function zoomReset () {
  zoomCurrent = 1;
  zoomProcessing();
  return;
}
