/*----------------------------------------------------------------------------*/
/*
<div id="node0" class="node testSize">
  <div class="port">
    <div id="pin0" class="pin disconnected"></div>
  </div>
  <div class="body">
    <a>Node 0</a>
  </div>
  <div class="port">
    <div id="pin1" class="pin disconnected"></div>
  </div>
</div>
*/
/*----------------------------------------------------------------------------*/
function addPin ( data ) {
  var text = "<div id='pin" + data.id + "' class='pin ";
  if ( data.type == "none" ) {
    text += "reseved";
  } else {
    text += "disconnected";
  }
  text += "'></div>"
  return text;
}
function makeHTMLnode ( id, type, inputs, outputs ) {
  var text = "<div id='node" + id + "' class='node hide'><div class='port input'>";
  for ( var i=0; i<inputs.length; i++ ) {
    text += addPin( inputs[i] );
  }
  text += "</div>";
  text += "<div id='body" + id + "' class='body'>";
  text += "<a>Node " + id + "</a>";
  text += "</div><div class='port output'>";
  for ( i=0; i<outputs.length; i++ ) {
    text += addPin( outputs[i] );
  }
  text += "</div></div>";
  return text;
}
/*----------------------------------------------------------------------------*/
module.exports.HTMLnode   = makeHTMLnode;
