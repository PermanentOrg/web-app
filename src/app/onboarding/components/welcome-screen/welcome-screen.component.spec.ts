import { Shallow } from 'shallow-render';
import { WelcomeScreenComponent } from './welcome-screen.component';
import { OnboardingModule } from '../../onboarding.module';

import { ArchiveVO } from '@models/archive-vo';

describe('WelcomeScreenComponent #onboarding', () => {
  let shallow: Shallow<WelcomeScreenComponent>;
  async function defaultRender(pendingArchives: ArchiveVO[] = []) {
     return await shallow.render(`<pr-welcome-screen [pendingArchives]="pendingArchives"></pr-welcome-screen>`, {
       bind: {
         pendingArchives,
       }
     });
  }
  beforeEach(() => {
    shallow = new Shallow(WelcomeScreenComponent, OnboardingModule);
  });
  it('should exist', async () => {
    const { find } = await defaultRender();
    expect(find('.welcome-screen')).toHaveFoundOne();
  });
  it('should have a button to continue onto next screen if there are no pending archives', async () => {
    const { find, outputs } = await defaultRender();
    expect(find('button')).toHaveFoundOne();
    expect(find('pr-archive-small')).not.toHaveFoundOne();
    find('button').nativeElement.click();
    expect(outputs.nextScreen.emit).toHaveBeenCalled();
  });
  it('should display a list of pending archives if they are available', async () => {
    const pendingArchives: ArchiveVO[] = [
      new ArchiveVO({
        fullName: 'Pending Test'
      }),
    ];
    const { find } = await defaultRender(pendingArchives);
    expect(find('pr-archive-small')).toHaveFoundOne();
  });
  it('should pass up a selected archive', async () => {
    const pendingArchives: ArchiveVO[] = [
      new ArchiveVO({
        fullName: 'Pending Test'
      }),
    ];
    const { element, find, outputs } = await defaultRender(pendingArchives);
    element.componentInstance.acceptPendingArchive(pendingArchives[0]);
    expect(outputs.acceptInvitation.emit).toHaveBeenCalledWith(pendingArchives[0]);
  });
});
