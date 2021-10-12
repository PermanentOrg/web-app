import { Shallow } from 'shallow-render';

import { CreateNewArchiveComponent } from './create-new-archive.component';
import { OnboardingModule } from '@onboarding/onboarding.module';

import { ArchiveVO } from '@models/archive-vo';

describe('CreateNewArchiveComponent #onboarding', () => {
  it('should exist', async () => {
    const shallow = new Shallow(CreateNewArchiveComponent, OnboardingModule);
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });
  it('should have an entry form', async () => {
    const shallow = new Shallow(CreateNewArchiveComponent, OnboardingModule);
    const { find } = await shallow.render();
    expect(find('pr-new-archive-form')).toHaveFoundOne();
  });
  it('should pass the created archive up to the parent component', async () => {
    const shallow = new Shallow(CreateNewArchiveComponent, OnboardingModule);
    const { find, outputs } = await shallow.render();
    const createdArchive = new ArchiveVO({
      fullName: 'Potato',
    });
    find('pr-new-archive-form').triggerEventHandler('success', createdArchive);
    expect(outputs.createdArchive.emit).toHaveBeenCalledWith(createdArchive);
  });
});
