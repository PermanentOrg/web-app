import { browser, by, element, ExpectedConditions } from 'protractor';
import { AppPage } from './app.po';

const HAMBURGER_MENU_DELAY = 500;

const TEST_ACCOUNT = {
  email: 'aatwood+e2e@permanent.org',
  password: 'Abc123!!!!'
};

describe('M-Dot', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should redirect to login screen when not logged in', () => {
    page.navigateTo();
    browser.wait(ExpectedConditions.urlContains('login'));
    expect(browser.getCurrentUrl()).toContain('/login');
  });

  it('should prompt for MFA token', () => {
    page.navigateTo();
    element(by.id('email')).sendKeys(TEST_ACCOUNT.email);
    element(by.id('password')).sendKeys(TEST_ACCOUNT.password);
    element(by.buttonText('Log in')).click();
    expect(browser.getCurrentUrl()).toContain('/mfa');
  });

  it('should log in', () => {
    page.navigateTo();
    (browser.manage() as any).addCookie({name: 'testing', value: '42'});
    element(by.id('email')).sendKeys(TEST_ACCOUNT.email);
    element(by.id('password')).sendKeys(TEST_ACCOUNT.password);
    element(by.buttonText('Log in')).click();
    expect(browser.getCurrentUrl()).not.toContain('/mfa');
  });

  it('should navigate to My Files from hamburger menu', () => {
    page.navigateTo();
    element(by.css('button.navbar-toggler')).click();
    const myFilesButton = element(by.linkText('My Files'));
    browser.sleep(HAMBURGER_MENU_DELAY);
    myFilesButton.click();
    expect(browser.getCurrentUrl()).toContain('/myfiles');
  });
});
