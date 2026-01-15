import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { AnnouncementModule } from '@announcement/announcement.module';
import { AnnouncementEvent } from '@announcement/models/announcement-event';
import { AnnouncementComponent } from './announcement.component';

const currentTestEvent: AnnouncementEvent = {
	start: Date.now(),
	end: Date.now() + 24 * 60 * 60 * 1000,
	message: 'Test Event!!!',
};

const pastTestEvent: AnnouncementEvent = {
	start: 1,
	end: 2,
	message: 'Past: This should not show up!',
};

const futureTestEvent: AnnouncementEvent = {
	start: Date.now() + 24 * 60 * 60 * 1000,
	end: Infinity,
	message: 'Future: This should not show up!',
};

Object.freeze(currentTestEvent);
Object.freeze(pastTestEvent);
Object.freeze(futureTestEvent);

describe('AnnouncementComponent', () => {
	beforeEach(async () => {
		await MockBuilder(AnnouncementComponent, AnnouncementModule);
	});

	afterEach(() => {
		window.localStorage.clear();
	});

	function defaultRender(events?: AnnouncementEvent[]) {
		return MockRender(
			`<pr-announcement [eventsList]="events"></pr-announcement>`,
			{ events },
		);
	}

	it('should exist', () => {
		const fixture = defaultRender([currentTestEvent]);

		expect(fixture).not.toBeNull();
	});

	it('should take in test data', () => {
		const fixture = defaultRender([currentTestEvent]);

		expect(fixture.debugElement).not.toBeNull();
	});

	it('should display the message', () => {
		const fixture = defaultRender([currentTestEvent]);

		expect(ngMocks.findAll('.announcement').length).toBeGreaterThan(0);
		expect(fixture.nativeElement.innerText).toContain('Test Event!!!');
	});

	it('should hide itself if event is in the future', () => {
		defaultRender([futureTestEvent]);

		expect(ngMocks.findAll('.announcement').length).toBe(0);
	});

	it('should hide itself if the event is already over', () => {
		defaultRender([pastTestEvent]);

		expect(ngMocks.findAll('.announcement').length).toBe(0);
	});

	it('should support multiple event definitions', () => {
		const fixture = defaultRender([
			pastTestEvent,
			currentTestEvent,
			futureTestEvent,
		]);

		expect(ngMocks.findAll('.announcement').length).toBe(1);
		expect(fixture.nativeElement.innerText).toContain('Test Event!!!');
	});

	it('should be dismissable', () => {
		const fixture = defaultRender([currentTestEvent]);

		expect(ngMocks.findAll('.dismiss-button').length).toBe(1);
		ngMocks.find('.dismiss-button').nativeElement.click();
		fixture.detectChanges();

		expect(ngMocks.findAll('.announcement').length).toBe(0);
	});

	it('should set dismissed setting in localStorage', () => {
		const fixture = defaultRender([currentTestEvent]);

		expect(ngMocks.findAll('.dismiss-button').length).toBe(1);
		ngMocks.find('.dismiss-button').nativeElement.click();
		fixture.detectChanges();

		expect(window.localStorage.getItem('announcementDismissed')).toBe(
			currentTestEvent.start.toString(),
		);
	});

	it('should recall dismissed setting from localStorage', () => {
		window.localStorage.setItem(
			'announcementDismissed',
			currentTestEvent.start.toString(),
		);
		defaultRender([currentTestEvent]);

		expect(ngMocks.findAll('.announcement').length).toBe(0);
	});

	it('should still be able to show a new announcement after dismissing a previous one', () => {
		window.localStorage.setItem('announcementDismissed', 'pastevent');
		defaultRender([currentTestEvent]);

		expect(ngMocks.findAll('.announcement').length).toBe(1);
	});

	it('should be able to handle an empty data array', () => {
		defaultRender([]);

		expect(ngMocks.findAll('.announcement').length).toBe(0);
	});

	it('should be able to handle the null case', () => {
		defaultRender();

		expect(ngMocks.findAll('.announcement').length).toBe(0);
	});

	describe('Layout Adjustment', () => {
		function renderWithAdjustables() {
			return MockRender(
				`<div class="adjust-for-announcement"></div><pr-announcement [eventsList]="events"></pr-announcement><div class="adjust-for-announcement"></div>`,
				{ events: [currentTestEvent] },
			);
		}

		function getAdjustedElements() {
			const adjustedElements = ngMocks.findAll('.adjust-for-announcement');

			expect(adjustedElements.length).toBeGreaterThan(0);
			return adjustedElements;
		}

		it('should adjust the page layout when it appears', () => {
			renderWithAdjustables();
			getAdjustedElements().forEach((element) => {
				expect(element.nativeElement.style.paddingTop).not.toBe('0px');
				expect(element.nativeElement.style.paddingTop).not.toBeUndefined();
			});
		});

		it('should readjust the page layout when it disappears', () => {
			const fixture = renderWithAdjustables();
			ngMocks.find('.dismiss-button').nativeElement.click();
			fixture.detectChanges();
			getAdjustedElements().forEach((element) => {
				expect(element.nativeElement.style.paddingTop).toBe('0px');
			});
		});
	});
});
