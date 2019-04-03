module.exports = {
    goToIndex: function(){
        return browser.get("https://github.com/");
    },
    waitSeconds: function(seconds){
        browser.sleep(seconds*1000);
    },
    goTo: function(url){
        return browser.get(url);
    },
    findByCss: function(css){
        return element(by.css(css));
    },
    findById: function(id){
        return element(by.id(id));
    }
}