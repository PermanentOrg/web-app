import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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
	beforeEach(async () => {
		prompted = false;
		await MockBuilder(AndroidAppNotifyComponent, AnnouncementModule);
	});

	afterEach(() => {
		localStorage.clear();
	});

	const waitForPromptEvent = async (
		fixture: ComponentFixture<AndroidAppNotifyComponent>,
	) => {
		const event = new DummyInstallPromptEvent();
		window.dispatchEvent(event);
		fixture.detectChanges();
		await fixture.whenStable();
	};

	it('should exist', () => {
		const fixture = MockRender(AndroidAppNotifyComponent);

		expect(fixture.debugElement).not.toBeNull();
	});

	it('should be invisible before `beforeinstallprompt` event', () => {
		MockRender(AndroidAppNotifyComponent);

		expect(ngMocks.findAll('div').length).toBe(0);
	});

	it('should appear when the `beforeinstallprompt` fires', async () => {
		const fixture = MockRender(AndroidAppNotifyComponent);
		await waitForPromptEvent(fixture);

		expect(ngMocks.findAll('div').length).toBeGreaterThan(0);
	});

	it('has a clickable button that shows the prompt', async () => {
		const fixture = MockRender(AndroidAppNotifyComponent);
		await waitForPromptEvent(fixture);
		ngMocks.findAll('.prompt-button')[0].triggerEventHandler('click', {});

		expect(prompted).toBeTruthy();
	});

	it('should dismiss itself after the App Install Banner appears', async () => {
		const fixture = MockRender(AndroidAppNotifyComponent);
		await waitForPromptEvent(fixture);
		ngMocks.findAll('.prompt-button')[0].triggerEventHandler('click', {});
		await fixture.whenStable();
		fixture.detectChanges();
		await fixture.whenStable();

		expect(ngMocks.findAll('div').length).toBe(0);
	});

	it('should be dismissable from a close button', async () => {
		const fixture = MockRender(AndroidAppNotifyComponent);
		await waitForPromptEvent(fixture);
		ngMocks.findAll('.dismiss-button')[0].triggerEventHandler('click', {});
		fixture.detectChanges();
		await fixture.whenStable();

		expect(ngMocks.findAll('div').length).toBe(0);
		const dismissed = localStorage.getItem(
			AndroidAppNotifyComponent.storageKey,
		);

		expect(dismissed).toBeTruthy();
	});

	it('should not show up if previously dismissed', async () => {
		localStorage.setItem(AndroidAppNotifyComponent.storageKey, 'true');
		const fixture = MockRender(AndroidAppNotifyComponent);
		await waitForPromptEvent(fixture);

		expect(ngMocks.findAll('div').length).toBe(0);
	});
});
