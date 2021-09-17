/*----------------------------------------------------------------------------*/
const dataSize = 16;
/*----------------------------------------------------------------------------*/
function Subadr () {
  var self    = this;
  this.enb    = false;
  this.adr    = 0;
  this.length = 0;
}
function Checker () {
  var self     = this;
  this.enb     = false;
  this.timeout = 0;
}
function Frame () {
  var self    = this;
  this.adr    = 0;
  this.subadr = new Subadr();
  this.cheker = new Checker();
}
/*----------------------------------------------------------------------------*/
module.exports.Frame = Frame;
/*----------------------------------------------------------------------------*/
