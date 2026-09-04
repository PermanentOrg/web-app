import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogFrameComponent } from './dialog-frame.component';

@Component({
	standalone: true,
	imports: [DialogFrameComponent],
	template: `<pr-dialog-frame
		[heading]="heading"
		[confirmLabel]="confirmLabel"
		[confirmDisabled]="confirmDisabled"
		(confirmed)="confirmedCount = confirmedCount + 1"
		(cancelled)="cancelledCount = cancelledCount + 1"
	>
		<p class="body-content">Body</p>
		<button prDialogFooterAside type="button" class="aside-content">
			Clear
		</button>
	</pr-dialog-frame>`,
})
class TestHostComponent {
	heading = 'Choose GPS Coordinates';
	confirmLabel = 'Save';
	confirmDisabled = false;
	confirmedCount = 0;
	cancelledCount = 0;
}

describe('DialogFrameComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	const query = <T extends HTMLElement>(selector: string): T =>
		fixture.nativeElement.querySelector(selector);

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should show the heading it was given', () => {
		expect(query('.pr-dialog-header h2').textContent.trim()).toBe(
			'Choose GPS Coordinates',
		);
	});

	it('should project the body content', () => {
		expect(query('.pr-dialog-body .body-content')).not.toBeNull();
	});

	it('should project footer content beside the actions', () => {
		expect(query('.pr-dialog-footer-aside .aside-content')).not.toBeNull();
	});

	it('should start the card at the top of the host', () => {
		const card = query('.pr-dialog-frame');
		const gap =
			card.getBoundingClientRect().top -
			(fixture.nativeElement as HTMLElement).getBoundingClientRect().top;

		expect(gap).toBe(0);
	});

	it('should label the actions', () => {
		expect(query('.pr-btn-cancel').textContent.trim()).toBe('Cancel');
		expect(query('.pr-btn-confirm').textContent.trim()).toBe('Save');
	});

	it('should take a different confirm label', () => {
		host.confirmLabel = 'Done';
		fixture.detectChanges();

		expect(query('.pr-btn-confirm').textContent.trim()).toBe('Done');
	});

	it('should report a confirm', () => {
		query<HTMLButtonElement>('.pr-btn-confirm').click();

		expect(host.confirmedCount).toBe(1);
	});

	it('should report a cancel from the footer button', () => {
		query<HTMLButtonElement>('.pr-btn-cancel').click();

		expect(host.cancelledCount).toBe(1);
	});

	it('should report a cancel from the header close button', () => {
		query<HTMLButtonElement>('.pr-close-button').click();

		expect(host.cancelledCount).toBe(1);
	});

	it('should disable confirm on request', () => {
		host.confirmDisabled = true;
		fixture.detectChanges();

		expect(query<HTMLButtonElement>('.pr-btn-confirm').disabled).toBeTrue();
	});

	it('should not report a confirm while it is disabled', () => {
		host.confirmDisabled = true;
		fixture.detectChanges();
		query<HTMLButtonElement>('.pr-btn-confirm').click();

		expect(host.confirmedCount).toBe(0);
	});
});
