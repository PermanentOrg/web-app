/* @format */
import { BehaviorSubject } from 'rxjs';
import { Shallow } from 'shallow-render';
import { OnboardingModule } from '@onboarding/onboarding.module';
import { ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { EventService } from '@shared/services/event/event.service';
import { CreateNewArchiveComponent } from './create-new-archive.component';

let calledCreate: boolean = false;
let createdArchive: ArchiveVO | null;
const mockApiService = {
  archive: {
    create: async (a: ArchiveVO) => {
      calledCreate = true;
      createdArchive = a;
      return {
        getArchiveVO: () => a,
      };
    },
  },
};

const mockAccountService = {
  getAccount: () => {
    return new AccountVO({ accountId: 1 });
  },
  createAccountForMe: new BehaviorSubject<{ name: string; action: string }>({
    name: '',
    action: '',
  }),
};

let shallow: Shallow<CreateNewArchiveComponent>;

function checkRadio(type: string, find: any): void {
  const radio = find(`input[value="${type}"]`);
  radio.triggerEventHandler('change', { target: radio[0].nativeElement });
}

function clickButton(selector: string, find: any): void {
  const button = find(selector);
  button.triggerEventHandler('click', { target: button[0].nativeElement });
}

function enterText(selector: string, text: string, find: any): void {
  const box = find(selector);
  box[0].nativeElement.value = text;
  box.triggerEventHandler('input', { target: box[0].nativeElement });
}

describe('CreateNewArchiveComponent #onboarding', () => {
  beforeEach(() => {
    calledCreate = false;
    createdArchive = null;
    shallow = new Shallow(CreateNewArchiveComponent, OnboardingModule)
      .mock(ApiService, mockApiService)
      .mock(AccountService, mockAccountService)
      .provide(EventService)
      .dontMock(EventService);
  });

  it('should exist', async () => {
    const { element } = await shallow.render();

    expect(element).not.toBeNull();
  });

  it('should emit a progress bar change event on mount', async () => {
    const { outputs } = await shallow.render();

    expect(outputs.progress.emit).toHaveBeenCalledWith(0);
  });

  it('the next button should be disabled if no goals have been selected', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.screen = 'goals';
    instance.selectedGoals = [];

    fixture.detectChanges();

    const button = find('.goals-next').nativeElement;

    expect(button.disabled).toBe(true);
  });

  it('should show the reasons screen after selecting goals and then clicking next', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.screen = 'goals';
    instance.selectedGoals = ['goal 1', 'goal 2'];

    fixture.detectChanges();

    find('.goals-next').triggerEventHandler('click', null);

    fixture.detectChanges();

    expect(instance.screen).toBe('reasons'); // Expecting the overlay to be present
  });

  it('the create archive button should not work without any reasons selected', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.screen = 'reasons';
    instance.selectedReasons = [];

    fixture.detectChanges();

    const button = find('.create-archive').nativeElement;

    expect(button.disabled).toBe(true);
  });

  it('should disable the Skip This Step and submit buttons when the archive has been submitted', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.screen = 'reasons';
    instance.isArchiveSubmitted = true;

    fixture.detectChanges();
    const submitButton = find('.create-archive').nativeElement;

    const skipStepButton = find('.skip-step').nativeElement;

    expect(submitButton.disabled).toBe(true);
    expect(skipStepButton.disabled).toBe(true);
  });
});
