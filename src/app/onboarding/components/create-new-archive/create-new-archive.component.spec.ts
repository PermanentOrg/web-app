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
  radio.triggerEventHandler('change', {target: radio[0].nativeElement});
}

function clickButton(selector: string, find: any): void {
  const button = find(selector);
  button.triggerEventHandler('click', {target: button[0].nativeElement});
}

function enterText(selector: string, text: string, find: any): void {
  const box = find(selector);
  box[0].nativeElement.value = text;
  box.triggerEventHandler('input', {target: box[0].nativeElement});
}

describe('CreateNewArchiveComponent #onboarding', () => {
  beforeEach(() => {
    calledCreate = false;
    createdArchive = null;
    shallow = new Shallow(CreateNewArchiveComponent, OnboardingModule)
    .mock(ApiService, mockApiService);
  });
  it('should exist', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });
  it('should emit a progress bar change event on mount', async () => {
    const { outputs } = await shallow.render();
    expect(outputs.progress.emit).toHaveBeenCalledWith(1);
  });
  it('should emit a progress bar change event when hitting next', async () => {
    const { find, outputs } = await shallow.render();
    checkRadio('type.archive.person', find);
    clickButton('.next-button', find);
    expect(outputs.progress.emit).toHaveBeenCalledWith(2);
  });
  it('should step forward and roll back progress properly', async () => {
    const { find, outputs } = await shallow.render();
    checkRadio('type.archive.person', find);
    clickButton('.next-button', find);
    clickButton('.back-button', find);
    expect(outputs.progress.emit).toHaveBeenCalledTimes(3);
  });
  it('should be able to exit out and go back', async () => {
    const { find, outputs } = await shallow.render();
    expect(outputs.back.emit).not.toHaveBeenCalled();
    clickButton('.back-button', find);
    expect(outputs.back.emit).toHaveBeenCalled();
  });
  it('should be able to create a new archive', async () => {
    const { find, fixture, instance, outputs } = await shallow.render();
    checkRadio('type.archive.organization', find);
    clickButton('.next-button', find);
    await fixture.detectChanges();
    enterText('#archive-name', 'Test Archive', find);
    // While simulating the form submit works in Jest, it doesn't work in Karma
    // So let's just call the handler directly.
    instance.onSubmit(new Event('submit'));
    await fixture.whenStable();
    expect(createdArchive.type).toBe('type.archive.organization');
    expect(createdArchive.fullName).toBe('Test Archive');
    expect(outputs.createdArchive.emit).toHaveBeenCalled();
  });
});
