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
    browser.waitForAngularEnabled(true);
  });

  it('should redirect to login screen when not logged in', () => {
    page.navigateTo();
    browser.wait(ExpectedConditions.urlContains('login'));
    expect(browser.getCurrentUrl()).toContain('/login');
  });

  it('should attempt to sign up for E2E test account', () => {
    page.goToSignup();
    browser.wait(ExpectedConditions.urlContains('signup'));
    expect(browser.getCurrentUrl()).toContain('/signup');
    element(by.id('invitation')).sendKeys('Permanent Archive');
    element(by.id('name')).sendKeys('E2E TEST');
    element(by.id('email')).sendKeys(TEST_ACCOUNT.email);
    element(by.id('password')).sendKeys(TEST_ACCOUNT.password);
    element(by.id('passwordConfirm')).sendKeys(TEST_ACCOUNT.password);
    element(by.id('terms')).click();
    element(by.buttonText('Sign up')).click();

    element(by.css('.alert-wrapper.visible')).isDisplayed()
      .then((visible) => {
        if (visible) {
          expect(browser.getCurrentUrl()).toContain('/signup');
        } else {
          expect(browser.getCurrentUrl()).not.toContain('/verify');
        }
      });
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
    waitForUpdate();
    (browser.manage() as any).addCookie({name: 'testing', value: '42'});
    element(by.id('email')).sendKeys(TEST_ACCOUNT.email);
    element(by.id('password')).sendKeys(TEST_ACCOUNT.password);
    element(by.buttonText('Log in')).click();
    expect(browser.getCurrentUrl()).not.toContain('/mfa');
  });

  it('should navigate to My Files from hamburger menu', () => {
    page.navigateTo();
    expect(browser.getCurrentUrl()).not.toContain('auth');
    element(by.css('button.navbar-toggler')).click();
    browser.sleep(HAMBURGER_MENU_DELAY);
    element(by.linkText('My Files')).click();
    expect(browser.getCurrentUrl()).toContain('/myfiles');
  });

  it('should have a Photos folder in My Files and navigate into it', () => {
    page.goToMyFiles();
    browser.waitForAngularEnabled(false);
    navigateIntoFolderByName('Photos');
    expect(element.all(by.css('.file-list-item')).count()).toBe(4);
  });

  it('should create a new folder', () => {
    let initialCount: number;
    const testName = new Date().toISOString();
    page.goToMyFiles();
    browser.waitForAngularEnabled(false);
    navigateIntoFolderByName('Test Folders');
    element.all(by.css('.file-list-item')).count()
    .then((count) => {
      initialCount = count;
      element(by.css('.right-menu-toggler')).click();
      browser.sleep(HAMBURGER_MENU_DELAY);
      element(by.linkText('Create New Folder')).click();
      browser.sleep(HAMBURGER_MENU_DELAY);
      element(by.id('folderName')).sendKeys(testName);
      element(by.buttonText('Create Folder')).click();
      browser.sleep(3000);
      expect(element.all(by.css('.file-list-item')).count()).toBe(initialCount + 1);
      const newFolderElement = element(by.cssContainingText('.file-list-item', testName));
      expect(newFolderElement.isPresent()).toBeTruthy();
    });
  });
});

function waitForUpdate() {
  return browser.sleep(0);
}

function navigateIntoFolderByName(folderName) {
  browser.wait(ExpectedConditions.presenceOf(element(by.css('.file-list-item'))));
  waitForUpdate();
  element(by.cssContainingText('.file-list-item', folderName)).click();
  browser.wait(ExpectedConditions.presenceOf(element(by.cssContainingText('.breadcrumb', folderName))));
  waitForUpdate();
}
