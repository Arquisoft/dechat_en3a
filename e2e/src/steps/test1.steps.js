let {defineSupportCode} = require('cucumber');
 
let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;

//utility class, navigation methods here
var nav = require('../basePO');
 
defineSupportCode( function({When, Then}) {
 When('I want to navigate to {string}', function(site) {
  nav.waitSeconds(1.5);
  return nav.goTo(site);
 });
 
 Then('the title should be something like {string}', function(title) {
  nav.waitSeconds(6);
  var title2 = nav.findById('tituloLogin');
 });
 
 When('I click the Register button', function() {
  nav.waitSeconds(1.5);
  var regButton = nav.findById('btRegister');
  return regButton.click();
 });
 
 Then('the page should contain {string}', function(title) {
  nav.waitSeconds(1.5);
  var title2 = nav.findById('tituloReg');
  return expect(title2.getText()).to.eventually.eql(title);
 });

});