/* @format */
import { Shallow } from 'shallow-render';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { By } from '@angular/platform-browser';
import { OnboardingModule } from '../../../onboarding.module';
import { ArchiveCreationStartScreenComponent } from './archive-creation-start-screen.component';
import { ApiService } from '@shared/services/api/api.service';

const mockAccountService = {
  getAccount: () => ({ fullName: 'John Doe' }),
};

describe('ArchiveCreationStartScreenComponent', () => {
  let shallow: Shallow<ArchiveCreationStartScreenComponent>;

  beforeEach(() => {
    shallow = new Shallow(ArchiveCreationStartScreenComponent, OnboardingModule)
      .mock(AccountService, mockAccountService)
      .import(HttpClientTestingModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should initialize with the account name', async () => {
    const { instance } = await shallow.render();

    expect(instance.name).toBe('John Doe');
  });

  it('should render the account name in the greeting', async () => {
    const { fixture } = await shallow.render();
    const greetingElement = fixture.debugElement.query(
      By.css('.greetings-container b'),
    ).nativeElement;

    expect(greetingElement.textContent).toContain('John Doe');
  });

  it('should emit getStartedOutput event when Get Started button is clicked', async () => {
    const { fixture, instance, outputs } = await shallow.render();
    spyOn(instance, 'getStarted').and.callThrough();

    const getStartedButton = fixture.debugElement.query(By.css('.get-started'));

    getStartedButton.triggerEventHandler('buttonClick', null);

    expect(instance.getStarted).toHaveBeenCalled();
    expect(outputs.getStartedOutput.emit).toHaveBeenCalled();
  });

  it('should emit createArchiveForMeOutput event when Create Archive for Me button is clicked', async () => {
    const { fixture, instance, outputs } = await shallow.render();
    spyOn(instance, 'createArchiveForMe').and.callThrough();

    const createArchiveButton = fixture.debugElement.query(
      By.css('.create-archive-for-me'),
    );
    createArchiveButton.triggerEventHandler('buttonClick', null);

    expect(instance.createArchiveForMe).toHaveBeenCalled();
    expect(outputs.createArchiveForMeOutput.emit).toHaveBeenCalled();
  });

  it('should fetch invite data and set sharer and shared item names when shareToken is present', async () => {
    const mockApi = {
      invite: {
        getFullShareInvite: jasmine.createSpy().and.returnValue(
          Promise.resolve({
            getInviteVO: () => ({
              AccountVO: { fullName: 'Sharer Name' },
              ArchiveVO: { fullName: 'Shared Item Name' },
            }),
          }),
        ),
      },
    };

    const { instance, fixture } = await shallow
      .mock(ApiService, mockApi)
      .render();

    spyOn(localStorage, 'getItem').and.returnValue('shareToken');

    instance.ngOnInit();
    await fixture.whenStable();

    expect(mockApi.invite.getFullShareInvite).toHaveBeenCalledWith(
      'shareToken',
    );
    expect(instance.sharerName).toBe('Sharer Name');
    expect(instance.sharedItemName).toBe('Shared Item Name');
  });

  it('should not fetch invite data if no shareToken is present', async () => {
    const mockApi = {
      invite: {
        getFullShareInvite: jasmine.createSpy(),
      },
    };

    const { instance, fixture } = await shallow
      .mock(ApiService, mockApi)
      .render();

    spyOn(localStorage, 'getItem').and.returnValue(null);

    instance.ngOnInit();
    await fixture.whenStable();

    expect(mockApi.invite.getFullShareInvite).not.toHaveBeenCalled();
    expect(instance.sharerName).toBeUndefined();
    expect(instance.sharedItemName).toBeUndefined();
  });

  it('should display text-no-share when hasShareToken is false', async () => {
    const { fixture } = await shallow.render();

    const textNoShareElement = fixture.debugElement.query(
      By.css('.text-no-share'),
    );
    const textShareElement = fixture.debugElement.query(By.css('.text-share'));

    expect(textNoShareElement).toBeTruthy();
    expect(textShareElement).toBeFalsy();
  });

  it('should display text-share when hasShareToken is true', async () => {
    const { fixture, instance } = await shallow.render();
    instance.hasShareToken = true;

    fixture.detectChanges();

    const textNoShareElement = fixture.debugElement.query(
      By.css('.text-no-share'),
    );
    const textShareElement = fixture.debugElement.query(By.css('.text-share'));

    expect(textNoShareElement).toBeFalsy();
    expect(textShareElement).toBeTruthy();
  });

  it('should not set sharerName or sharedItemName if no token is present', async () => {
    const { instance } = await shallow.render();
    spyOn(localStorage, 'getItem').and.returnValue(null); // No token

    instance.ngOnInit();

    expect(instance.sharerName).toBeUndefined();
    expect(instance.sharedItemName).toBeUndefined();
  });

  it('should set hasShareToken to true if a token is found in localStorage', async () => {
    const mockApi = {
      invite: {
        getFullShareInvite: jasmine.createSpy().and.returnValue(
          Promise.resolve({
            getInviteVO: () => ({
              AccountVO: { fullName: 'Sharer Name' },
              ArchiveVO: { fullName: 'Shared Item Name' },
            }),
          }),
        ),
      },
    };

    spyOn(localStorage, 'getItem').and.returnValue('shareToken'); // Simulate token in localStorage

    const { instance, fixture } = await shallow
      .mock(ApiService, mockApi) // Mock the API service to prevent actual HTTP requests
      .render();

    instance.ngOnInit(); // Manually trigger ngOnInit
    await fixture.whenStable(); // Wait for promises to resolve

    // Check if hasShareToken is set to true
    expect(instance.hasShareToken).toBeTrue();

    // Ensure the API call is made with the correct token
    expect(mockApi.invite.getFullShareInvite).toHaveBeenCalledWith(
      'shareToken',
    );

    // Check that the data from the API was properly assigned to instance variables
    expect(instance.sharerName).toBe('Sharer Name');
    expect(instance.sharedItemName).toBe('Shared Item Name');
  });
});
