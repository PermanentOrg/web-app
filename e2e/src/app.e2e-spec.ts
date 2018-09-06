import { browser, by, element, ExpectedConditions } from 'protractor';
import { AppPage } from './app.po';

const HAMBURGER_MENU_DELAY = 500;

const TEST_ACCOUNT = {
  email: 'aatwood+e2e@permanent.org',
  password: 'Abc123!!!!'
};

const TEST_ARCHIVE_1 = {
  name: 'E2E Test'
};

const TEST_ARCHIVE_2 = {
  name: 'Second Archive'
};

describe('Login/Signup Flow', () => {
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
    element(by.id('name')).sendKeys(TEST_ARCHIVE_1.name);
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
});

describe('File Navigation Flow', () => {
  let page: AppPage;
  let newFolderName: string;

  beforeEach(() => {
    page = new AppPage();
    browser.waitForAngularEnabled(true);
  });

  it('should have a Photos folder in My Files and navigate into it', () => {
    page.goToMyFiles();
    browser.waitForAngularEnabled(false);
    navigateIntoFolderByName('Photos');
    expect(element.all(by.css('.file-list-item')).count()).toBe(4);
  });

  it('should create a new folder', () => {
    let initialCount: number;
    newFolderName = new Date().toISOString();
    page.goToMyFiles();
    browser.waitForAngularEnabled(false);
    navigateIntoFolderByName('Test Folders');
    element.all(by.css('.file-list-item')).count()
    .then((count) => {
      initialCount = count;
      element(by.css('nav .right-menu-toggler')).click();
      browser.sleep(HAMBURGER_MENU_DELAY);
      element(by.linkText('Create New Folder')).click();
      browser.sleep(HAMBURGER_MENU_DELAY);
      element(by.id('folderName')).sendKeys(newFolderName);
      element(by.buttonText('Create Folder')).click();
      browser.sleep(3000);
      expect(element.all(by.css('.file-list-item')).count()).toBe(initialCount + 1);
      const newFolderElement = element(by.cssContainingText('.file-list-item', newFolderName));
      expect(newFolderElement.isPresent()).toBeTruthy();
    });
  });

  it('should rename the new folder', () => {
    page.goToMyFiles();
    browser.waitForAngularEnabled(false);
    navigateIntoFolderByName('Test Folders');
    const newFolder = element(by.cssContainingText('.file-list-item', newFolderName));
    newFolder.element(by.css('.actions button')).click();
    browser.sleep(HAMBURGER_MENU_DELAY);
    element(by.buttonText('Rename')).click();
    browser.sleep(HAMBURGER_MENU_DELAY * 2);
    element(by.id('displayName')).sendKeys('RENAME ME');
    element(by.buttonText('Save')).click();
    browser.sleep(3000);
    const renamedFolder = element(by.cssContainingText('.file-list-item', 'RENAME ME'));
    renamedFolder.element(by.css('.actions button')).click();
    browser.sleep(HAMBURGER_MENU_DELAY);
    element(by.buttonText('Rename')).click();
    browser.sleep(HAMBURGER_MENU_DELAY * 2);
    element(by.id('displayName')).sendKeys(newFolderName);
    element(by.buttonText('Save')).click();
    browser.sleep(3000);
    expect(newFolder.isPresent()).toBeTruthy();
    expect(newFolder.element(by.css('.name')).getText()).toEqual(newFolderName);
  });


  it('should delete the previously created folder', () => {
    let initialCount: number;
    page.goToMyFiles();
    browser.waitForAngularEnabled(false);
    navigateIntoFolderByName('Test Folders');
    waitForUpdate();
    element.all(by.css('.file-list-item')).count()
    .then((count) => {
      browser.sleep(1000);
      initialCount = count;
      const newFolderElement = element(by.cssContainingText('.file-list-item', newFolderName));
      newFolderElement.element(by.css('button.right-menu-toggler')).click();
      browser.sleep(HAMBURGER_MENU_DELAY);
      element(by.buttonText('Delete')).click();
      browser.sleep(3000);
      expect(element.all(by.css('.file-list-item')).count()).toBe(initialCount - 1);
      expect(newFolderElement.isPresent()).toBeFalsy();
    });
  });
});

describe('Multiple Archives Flow', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    browser.waitForAngularEnabled(true);
  });

  it('should be logged into default archive', () => {
    page.navigateTo();
    waitForUpdate();
    element(by.css('button.navbar-toggler')).click();
    browser.sleep(HAMBURGER_MENU_DELAY);
    expect(element(by.css('pr-archive-small .archive-name')).getText()).toContain(TEST_ARCHIVE_1.name);
  });

  it('should have second archive and switch to it', () => {
    page.goToArchiveSelector();
    waitForUpdate();
    const secondArchive = element(by.cssContainingText('.archive-list pr-archive-small', TEST_ARCHIVE_2.name));
    browser.wait(ExpectedConditions.elementToBeClickable(secondArchive));
    secondArchive.click();
    browser.sleep(HAMBURGER_MENU_DELAY);
    element(by.buttonText('Switch archive')).click();
    browser.wait(ExpectedConditions.urlContains('myfiles'));
    browser.waitForAngularEnabled(false);
    browser.sleep(1000);
    element(by.css('button.navbar-toggler')).click();
    browser.sleep(HAMBURGER_MENU_DELAY);
    expect(element(by.css('pr-archive-small .archive-name')).getText()).toContain(TEST_ARCHIVE_2.name);
  });

  it('should switch back to the first archive', () => {
    page.goToArchiveSelector();
    waitForUpdate();
    const firstArchive = element(by.cssContainingText('.archive-list pr-archive-small', TEST_ARCHIVE_1.name));
    browser.wait(ExpectedConditions.elementToBeClickable(firstArchive));
    expect(firstArchive.isPresent()).toBeTruthy();
    firstArchive.click();
    browser.sleep(HAMBURGER_MENU_DELAY);
    element(by.buttonText('Switch archive')).click();
    browser.wait(ExpectedConditions.urlContains('myfiles'));
    browser.waitForAngularEnabled(false);
    browser.sleep(1000);
    element(by.css('button.navbar-toggler')).click();
    browser.sleep(HAMBURGER_MENU_DELAY);
    expect(element(by.css('pr-archive-small .archive-name')).getText()).toContain(TEST_ARCHIVE_1.name);
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
