let {defineSupportCode} = require('cucumber');
 
let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;

//utility class, navigation methods here
var nav = require('../basePO');
 
defineSupportCode( function({When, Then}) {
 When('I navigate to {string}', function(site) {
  nav.waitSeconds(1.5);
  return nav.goTo(site);
 });
 
 Then('the title should be {string}', function(title) {
  nav.waitSeconds(1.5);
  return expect(browser.getTitle()).to.eventually.eql(title);
 });
 
 When('I click the Docs button', function() {
  nav.waitSeconds(1.5);
  var docButton = nav.findByCss('[title="Docs"]');
   return docButton.click();
 });
 
 Then('I should see a {string} article', function(title) {
  nav.waitSeconds(1.5); 
  var article = nav.findById('what-is-angular');
  nav.waitSeconds(1.5);
  return expect(article.getText()).to.eventually.eql(title);
 });

 When('I click the Resources button', function() {
  nav.waitSeconds(1.5);
  var resourcesButton = nav.findByCss('[title="Resources"]');
  return resourcesButton.click();
 });

 Then('I should see a {string} article', function(title) {
  nav.waitSeconds(1.5);
  var article = nav.findById('what-is-angular');
  nav.waitSeconds(1.5);
  return expect(article.getText()).to.eventually.eql(title);
 });
});
