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
/*
<li class="nav-item" role="presentation">
  <a class="nav-link active" id="scheme1-tab" data-toggle="tab" href="#scheme1" role="tab" aria-controls="scheme1" aria-selected="true">Схема 1</a>
</li>
*/
/*----------------------------------------------------------------------------*/
/*
<div class="tab-pane fade show active" id="scheme1" role="tabpanel" aria-labelledby="scheme1-tab">
<div class="tab-pane fade" id="scheme2" role="tabpanel" aria-labelledby="scheme2-tab"></div>
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
function makeHTMLscheme ( id ) {
  var text = "<div class='tab-pane fade";
  if ( id == 0 ) {
    text += " show active";
  }
  text += "' id='scheme" + id + "' role='tabpanel' aria-labelledby='scheme" + id + "-tab'></div>";
  return text;
}
function makeHTMLtab ( id ) {
  var text = "<li class='nav-item' role='presentation'><a class='nav-link"
  if ( id == 0 ) {
    text += " active";
  }
  text += "' id='scheme" + id + "-tab' data-toggle='tab' href='#scheme" + id + "' role='tab' aria-controls='scheme" + id +"' aria-selected='";
  if ( id == 0 ) {
    text += "true";
  } else {
    text += "false";
  }
  text += "'>Схема " + id + "</a></li>"
  return text;
}
/*----------------------------------------------------------------------------*/
module.exports.HTMLnode   = makeHTMLnode;
module.exports.HTMLscheme = makeHTMLscheme;
module.exports.HTMLtab    = makeHTMLtab;
