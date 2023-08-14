/* @format */
import { Shallow } from 'shallow-render';

import { AnnouncementModule } from '@announcement/announcement.module';
import {
  AndroidAppNotifyComponent,
  BeforeInstallPromptEvent,
} from './android-app-notify.component';

class DummyInstallPromptEvent
  extends Event
  implements BeforeInstallPromptEvent
{
  constructor() {
    super('beforeinstallprompt');
  }

  public async prompt(): Promise<void> {
    prompted = true;
  }

  get userChoice(): Promise<'accepted' | 'dismissed'> {
    return Promise.resolve('accepted');
  }
}

let prompted: boolean;

describe('AndroidAppNotifyComponent', () => {
  let shallow: Shallow<AndroidAppNotifyComponent>;
  const waitForPromptEvent = async (fixture) => {
    const event = new DummyInstallPromptEvent();
    window.dispatchEvent(event);
    fixture.detectChanges();
    await fixture.whenStable();
  };
  beforeEach(() => {
    prompted = false;
    shallow = new Shallow(AndroidAppNotifyComponent, AnnouncementModule);
  });
  afterEach(() => {
    localStorage.clear();
  });
  it('should exist', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });
  it('should be invisible before `beforeinstallprompt` event', async () => {
    const { find } = await shallow.render();
    expect(find('div').length).toBe(0);
  });
  it('should appear when the `beforeinstallprompt` fires', async () => {
    const { find, fixture } = await shallow.render();
    await waitForPromptEvent(fixture);
    expect(find('div').length).toBeGreaterThan(0);
  });
  it('has a clickable button that shows the prompt', async () => {
    const { find, fixture } = await shallow.render();
    await waitForPromptEvent(fixture);
    find('.prompt-button')[0].triggerEventHandler('click', {});
    expect(prompted).toBeTruthy();
  });
  it('should dismiss itself after the App Install Banner appears', async () => {
    const { find, fixture } = await shallow.render();
    await waitForPromptEvent(fixture);
    find('.prompt-button')[0].triggerEventHandler('click', {});
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(find('div').length).toBe(0);
  });
  it('should be dismissable from a close button', async () => {
    const { find, fixture } = await shallow.render();
    await waitForPromptEvent(fixture);
    find('.dismiss-button')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    await fixture.whenStable();
    expect(find('div').length).toBe(0);
    const dismissed = localStorage.getItem(
      AndroidAppNotifyComponent.storageKey
    );
    expect(dismissed).toBeTruthy();
  });
  it('should not show up if previously dismissed', async () => {
    localStorage.setItem(AndroidAppNotifyComponent.storageKey, 'true');
    const { find, fixture } = await shallow.render();
    await waitForPromptEvent(fixture);
    expect(find('div').length).toBe(0);
  });
});
