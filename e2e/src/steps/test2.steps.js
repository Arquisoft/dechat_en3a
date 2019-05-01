let {defineSupportCode} = require('cucumber');
 
let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;

//utility class, navigation methods here
var nav = require('../basePO');
 
defineSupportCode( function({When, Then}) {
 When('I want to navigate to the chat {string}', function(site) {
  nav.waitSeconds(1.5);
  return nav.goTo(site);
 });
 Then('the page should contain the following {string}', function(title) {
  nav.waitSeconds(1.5);
  var title2 = nav.findByCss('h1');
  return expect(title2.getText()).to.eventually.eql(title);
 });

});