import { browser, by, element } from 'protractor';

export class AppPage {

    navigateTo() {
        return browser.get('/login');
    }

    getTitleText() {
       // return element(by.css('app-root h1')).getText();
        return element(by.css('h1')).getText();
    }
    getButtonText() {
        return element(by.css('button')).getText();
    }
      navigateToCard(){
        return browser.get('/card');
    }

    clickRegisterButton(){
        return element(by.id('register')).click();
    }

    clickSolidRegistration(){
        return  element(by.id('solidregister')).click();
    }

    clickLoginButton(){
        return  element(by.id('login')).click();
    }
}
