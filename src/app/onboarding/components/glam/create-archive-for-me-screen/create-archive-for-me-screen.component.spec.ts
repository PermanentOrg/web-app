/* @format */
import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { By } from '@angular/platform-browser';
import { OnboardingModule } from '../../../onboarding.module';
import { CreateArchiveForMeScreenComponent } from './create-archive-for-me-screen.component';

const mockAccountService = {
  getAccount: () => ({ fullName: 'John Doe' }),
};

describe('CreateArchiveForMeScreenComponent', () => {
  let shallow: Shallow<CreateArchiveForMeScreenComponent>;

  beforeEach(async () => {
    shallow = new Shallow(
      CreateArchiveForMeScreenComponent,
      OnboardingModule,
    ).mock(AccountService, mockAccountService);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should initialize name with the account full name', async () => {
    const { instance } = await shallow.render();

    expect(instance.name).toBe('John Doe');
  });

  it('should render the archive name in the template', async () => {
    const { find } = await shallow.render();
    const archiveNameElement = find('.archive-name');

    expect(archiveNameElement.nativeElement.textContent).toContain('John Doe');
  });

  it('should emit goBackOutput when the Back button is clicked', async () => {
    const { fixture, outputs } = await shallow.render();
    const backButton = fixture.debugElement.query(By.css('.back'));

    backButton.triggerEventHandler('buttonClick', null);

    expect(outputs.goBackOutput.emit).toHaveBeenCalledWith('start');
  });

  it('should emit continueOutput with correct payload when the Yes, create archive button is clicked', async () => {
    const { outputs, fixture } = await shallow.render();
    const continueButton = fixture.debugElement.query(By.css('.continue'));

    continueButton.triggerEventHandler('buttonClick', null);

    expect(outputs.continueOutput.emit).toHaveBeenCalledWith({
      screen: 'goals',
      type: 'type.archive.person',
      name: 'John Doe',
    });
  });
});
