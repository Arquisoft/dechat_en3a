let {defineSupportCode} = require('cucumber');
 
let chai = require('chai').use(require('chai-as-promised'));
let expect = chai.expect;
 
defineSupportCode( function({When, Then}) {
 When('I navigate to {string}', function(site) {
   return browser.get(site);
 });
 
 Then('the title should be {string}', function(title) {
   return expect(browser.getTitle()).to.eventually.eql(title);
 });
 
 When('I click the Docs button', function() {
   var docButton = element(by.css('[title="Docs"]'));
 
   return docButton.click();
 });
 
 Then('I should see a {string} article', function(title) {
   var article = element(by.id('what-is-angular'));
 
   return expect(article.getText()).to.eventually.eql(title);
 });
});