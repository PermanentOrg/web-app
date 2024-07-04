/* @format */
import { Shallow } from 'shallow-render';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { By } from '@angular/platform-browser';
import { OnboardingModule } from '../../onboarding.module';
import { ArchiveCreationStartScreenComponent } from './archive-creation-start-screen.component';

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
});
