import { browser, by, element, ExpectedConditions } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/m/');
  }

  goToSignup() {
    return browser.get('/m/auth/signup');
  }

  goToHome() {
    browser.get('/m/');
    return browser.wait(ExpectedConditions.urlIs(`${browser.baseUrl}m/`));
  }

  goToMyFiles() {
    browser.get('/m/myfiles');
    return browser.wait(ExpectedConditions.urlContains('myfiles'));
  }
}
