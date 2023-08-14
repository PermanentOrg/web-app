/* format */
import { Shallow } from 'shallow-render';
import { OnboardingModule } from '@onboarding/onboarding.module';
import { ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
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
      }
    }
  },
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
  });
  it('should exist', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });
  it('should emit a progress bar change event on mount', async () => {
    const { outputs } = await shallow.render();
    expect(outputs.progress.emit).toHaveBeenCalledWith(0);
  });
  // it('should be able to exit out and go back', async () => {
  //   const { find, outputs } = await shallow.render();
  //   expect(outputs.back.emit).not.toHaveBeenCalled();
  //   clickButton('.back-button', find);
  //   expect(outputs.back.emit).toHaveBeenCalled();
  // });
  it('should NOT show disabled-overlay when selectedValue is truthy', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.screen = 'create';

    const childComponent = find('pr-archive-type-select').componentInstance;
    childComponent.valueChange.emit('Some Value');

    fixture.detectChanges();

    const overlayDiv = find('.disabled-overlay');
    expect(overlayDiv.length).toBe(0);
  });

  it('should enable the next button if a name has been inputted', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.screen = 'create';
    const childComponent = find('pr-archive-type-select').componentInstance;
    childComponent.valueChange.emit('Some Value');

    instance.name = "Some Name"

    fixture.detectChanges();

    const button = find('.chart-path').nativeElement;
    expect(button.disabled).toBe(false);
  })


  it('should show disabled-overlay when selectedValue is falsy', async () => {
    const { find, instance } = await shallow.render();

    instance.selectedValue = '';
    const overlayDiv = find('.disabled-overlay');
    expect(overlayDiv.length).toBe(1);
  });

  it('should show the goals screen after selecting a value and inputting a name and then clicking next', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.screen = 'create';

    find('.chart-path').triggerEventHandler('click', null);

    fixture.detectChanges();

    expect(instance.screen).toBe('goals');
  });

  it('the next button should be disabled if no goals have been selected', async () => {
    const { find, instance, fixture } = await shallow.render();
    instance.screen = 'goals';
    instance.selectedGoals = [];

    fixture.detectChanges();

    const button = find('.goals-next').nativeElement;

    expect(button.disabled).toBe(true);
  })

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
  })

});
