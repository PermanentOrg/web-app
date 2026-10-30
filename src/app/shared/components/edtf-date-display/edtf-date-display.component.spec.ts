import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { EdtfDisplayService } from '@shared/services/edtf-service/edtf-display.service';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { EdtfDateDisplayComponent } from './edtf-date-display.component';

describe('EdtfDateDisplayComponent', () => {
	beforeEach(async () => {
		await MockBuilder(EdtfDateDisplayComponent)
			.keep(EdtfDisplayService)
			.keep(NoopAnimationsModule);
	});

	const render = (
		displayTime: string | null,
		showTime = true,
		timezone: string | null = null,
	) =>
		MockRender(EdtfDateDisplayComponent, { displayTime, showTime, timezone });

	const partTexts = (): string[] =>
		ngMocks
			.findAll('.part')
			.map((part) => ngMocks.formatText(part).replace(/\s+/g, ' ').trim());

	const moreInfoIconCount = (): number => ngMocks.findAll('.more-info').length;

	it('should create', () => {
		const fixture = render('1985-04-12');

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('should render a single value as one part', () => {
		render('1985-04-12');

		expect(partTexts()).toEqual(['Apr. 12, 1985']);
	});

	it('should render the end of a range as its own part', () => {
		render('1985-04-12/1985-06-10');

		expect(partTexts()).toEqual(['Apr. 12 —', 'Jun. 10, 1985']);
	});

	it('should mark annotation segments so they can be muted', () => {
		render('1984~');

		expect(ngMocks.find('.annotation').nativeElement.textContent).toBe(' ~');
	});

	it('should render the time as its own part behind a separator', () => {
		render('1985-04-12T23:20:30');

		expect(partTexts()).toEqual(['Apr. 12, 1985•', '11:20 PM']);
		expect(ngMocks.findAll('.separator').length).toBe(1);
	});

	it('should render the zone of the item after the time', () => {
		render('2026-06-24T15:00:00', true, 'Asia/Jerusalem');

		expect(partTexts()).toEqual(['Jun. 24, 2026•', '3:00 PM IDT']);
	});

	it('should not render the zone when showTime is off', () => {
		render('1985-04-12T23:20:30', false, 'America/Chicago');

		expect(partTexts()).toEqual(['Apr. 12, 1985']);
	});

	it('should hide the time when showTime is off', () => {
		render('1985-04-12T23:20:30', false);

		expect(partTexts()).toEqual(['Apr. 12, 1985']);
		expect(ngMocks.findAll('.separator').length).toBe(0);
	});

	it('should put the info icon after the end of a range hiding its times', () => {
		render('1985-04-12T09:00:00Z/1985-06-10T17:00:00Z');

		expect(moreInfoIconCount()).toBe(1);
		expect(ngMocks.findAll('.part')[1].nativeElement.textContent).toContain(
			'info',
		);
	});

	it('should put the info icon after the start of an open range hiding its time', () => {
		render('1985-04-12T09:00:00Z/');

		expect(partTexts().length).toBe(1);
		expect(moreInfoIconCount()).toBe(1);
	});

	it('should not show the info icon or enable the tooltip when nothing is hidden', () => {
		render('1985-04-12/1985-06-10');

		expect(moreInfoIconCount()).toBe(0);
		expect(ngMocks.findInstance(NgbTooltip).disableTooltip).toBeTrue();
	});

	it('should enable the tooltip when a range hides its times', () => {
		render('1985-04-12T09:00:00Z/1985-06-10T17:00:00Z');

		expect(ngMocks.findInstance(NgbTooltip).disableTooltip).toBeFalse();
	});

	it('should render nothing for an absent value', () => {
		render(null);

		expect(partTexts()).toEqual(['']);
	});
});
