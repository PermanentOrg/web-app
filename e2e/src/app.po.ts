import { browser, by, element, ExpectedConditions } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/m/');
  }

  goToSignup() {
    return browser.get('/m/auth/signup');
  }

  goToMyFiles() {
    browser.get('/m/myfiles');
    return browser.wait(ExpectedConditions.urlContains('myfiles'));
  }

  goToArchiveSelector() {
    browser.get('/m/choosearchive');
    return browser.wait(ExpectedConditions.urlContains('choosearchive'));
  }
}
