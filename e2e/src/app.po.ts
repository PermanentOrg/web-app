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

  goToApps() {
    browser.get('/m/apps');
    return browser.wait(ExpectedConditions.urlContains('apps'));
  }

  goToArchiveSelector() {
    browser.get('/m/choosearchive');
    return browser.wait(ExpectedConditions.urlContains('choosearchive'));
  }
}
