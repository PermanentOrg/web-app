import { Shallow } from 'shallow-render';
import { Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OnboardingComponent } from './onboarding.component';
import { OnboardingModule } from '../../onboarding.module';

import { ArchiveVO } from '@models/archive-vo';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';

class NullRoute {
  public snapshot = {
    data: {}
  };
}

describe('OnboardingComponent #onboarding', () => {
  let shallow: Shallow<OnboardingComponent>;
  beforeEach(() => {
    shallow = new Shallow(OnboardingComponent, OnboardingModule).mock(ActivatedRoute, new NullRoute()).mock(Location, { go: (path: string) => {}}).replaceModule(RouterModule, RouterTestingModule);
  });
  it('should exist', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });
  it('should load the welcome screen as default', async () => {
    const { find } = await shallow.render();
    expect(find('pr-welcome-screen')).toHaveFoundOne();
  });
  it('can change screens', async () => {
    const { find, fixture } = await shallow.render();
    expect(find('pr-welcome-screen')).toHaveFoundOne();
    find('pr-welcome-screen').triggerEventHandler('nextScreen', OnboardingScreen.newArchive);
    fixture.detectChanges();
    expect(find('pr-welcome-screen')).toHaveFound(0);
  });
  it('stores the newly created archive', async () => {
    const { element, find, fixture } = await shallow.render();
    expect(element.componentInstance.currentArchive).toBeUndefined();
    expect(find('pr-welcome-screen')).toHaveFoundOne();
    find('pr-welcome-screen').triggerEventHandler('nextScreen', OnboardingScreen.newArchive);
    fixture.detectChanges();
    find('pr-create-new-archive').triggerEventHandler('createdArchive', new ArchiveVO({}));
    expect(element.componentInstance.currentArchive).not.toBeUndefined();
  });
  it('stores an accepted archive invitation', async () => {
    const { element, find, fixture } = await shallow.render();
    expect(element.componentInstance.currentArchive).toBeUndefined();
    expect(find('pr-welcome-screen')).toHaveFoundOne();
    find('pr-welcome-screen').triggerEventHandler('acceptInvitation', new ArchiveVO({fullName: 'Pending Test'}));
    fixture.detectChanges();
    expect(element.componentInstance.currentArchive).not.toBeUndefined();
  });
  it('can be tested with debugging component', async () => {
    const { element } = await shallow.render();
    expect(element.componentInstance.pendingArchives.length).toBe(0);
    element.componentInstance.setState({
      pendingArchives: [new ArchiveVO({})]
    });
    expect(element.componentInstance.pendingArchives.length).toBe(1);
  });
});
