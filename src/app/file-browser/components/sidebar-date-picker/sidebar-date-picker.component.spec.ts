import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { Meridian } from '@shared/components/timepicker-input/timepicker-input.component';
import { EditDateModel } from '../edit-date-time-modal/edit-date-time.model';
import { SidebarDatePickerComponent } from './sidebar-date-picker.component';

@Component({
	template: `
		<pr-sidebar-date-picker
			[displayDT]="displayDT"
			[displayEndDT]="displayEndDT"
			[disabled]="disabled"
			(saveClicked)="onSaveClicked($event)"
			(moreOptionsClicked)="onMoreOptionsClicked($event)"
		/>
	`,
	standalone: false,
})
class TestHostComponent {
	displayDT: string | null = null;
	displayEndDT: string | null = null;
	disabled = false;
	savedValue: string | null = null;
	savedEndDateValue: string | null | undefined = undefined;
	moreOptionsData: EditDateModel | null = null;

	onSaveClicked(value: { displayDT: string; displayEndDT?: string | null }) {
		this.savedValue = value.displayDT;
		if (value.displayEndDT !== undefined) {
			this.savedEndDateValue = value.displayEndDT;
		}
	}
	onMoreOptionsClicked(data: EditDateModel) {
		this.moreOptionsData = data;
	}
}

describe('SidebarDatePickerComponent', () => {
	let host: TestHostComponent;
	let fixture: ComponentFixture<TestHostComponent>;
	let component: SidebarDatePickerComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SidebarDatePickerComponent],
			declarations: [TestHostComponent],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
		fixture.detectChanges();
		component = fixture.debugElement.children[0].componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('display', () => {
		it('should show placeholder when no date is set', () => {
			const placeholder = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-placeholder',
			);

			expect(placeholder).toBeTruthy();
			expect(placeholder.textContent.trim()).toBe('Click to add date');
		});

		it('should show "No date" placeholder when disabled and no date', () => {
			host.disabled = true;
			fixture.detectChanges();

			const placeholder = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-placeholder',
			);

			expect(placeholder.textContent.trim()).toBe('No date');
		});

		it('should display formatted from date when displayDT is set', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			const value = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-value',
			);

			expect(value).toBeTruthy();
			expect(value.textContent.trim()).toBe('May 1985');
		});

		it('should display year-only date', () => {
			host.displayDT = '1985';
			fixture.detectChanges();

			const value = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-value',
			);

			expect(value.textContent.trim()).toBe('1985');
		});

		it('should display full date with day', () => {
			host.displayDT = '1985-05-20';
			fixture.detectChanges();

			const value = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-value',
			);

			expect(value.textContent.trim()).toBe('May 20, 1985');
		});

		it('should display date with time', () => {
			host.displayDT = '1985-05-20T14:30';
			fixture.detectChanges();

			const value = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-value',
			);

			expect(value.textContent.trim()).toContain('May 20, 1985');
			expect(value.textContent.trim()).toContain('2:30:00 PM');
		});

		it('should not show To row when no end date', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			const toRow = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-to-row',
			);

			expect(toRow).toBeFalsy();
		});

		it('should show To row when end date is set', () => {
			host.displayDT = '1985-05';
			host.displayEndDT = '1990-06';
			fixture.detectChanges();

			const toRow = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-to-row',
			);

			expect(toRow).toBeTruthy();

			const toValue = toRow.querySelector('.pr-sidebar-date-picker-row-value');

			expect(toValue.textContent.trim()).toBe('June 1990');
		});
	});

	describe('qualifiers', () => {
		it('should not show qualifiers when none are active', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			const qualifiers = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-qualifiers',
			);

			expect(qualifiers).toBeFalsy();
		});

		it('should display qualifiers from EDTF string with ~ (approximate)', () => {
			host.displayDT = '1985-05~';
			fixture.detectChanges();

			const qualifiers = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-qualifiers',
			);

			expect(qualifiers).toBeTruthy();
			expect(qualifiers.textContent).toContain('Approximate');
		});

		it('should display qualifiers from EDTF string with ? (uncertain)', () => {
			host.displayDT = '1985-05?';
			fixture.detectChanges();

			const qualifiers = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-qualifiers',
			);

			expect(qualifiers).toBeTruthy();
			expect(qualifiers.textContent).toContain('Uncertain');
		});

		it('should display both qualifiers from EDTF string with % (approximate + uncertain)', () => {
			host.displayDT = '1985-05%';
			fixture.detectChanges();

			const qualifiers = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-qualifiers',
			);

			expect(qualifiers).toBeTruthy();
			expect(qualifiers.textContent).toContain('Approximate');
			expect(qualifiers.textContent).toContain('Uncertain');
		});
	});

	describe('toggle and dropdown', () => {
		it('should not open when disabled', () => {
			host.disabled = true;
			fixture.detectChanges();

			component.toggle();

			expect(component.isDropdownOpen()).toBeFalse();
		});

		it('should open dropdown on toggle', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			component.toggle();

			expect(component.isDropdownOpen()).toBeTrue();
		});

		it('should close dropdown on second toggle', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			component.toggle();

			expect(component.isDropdownOpen()).toBeTrue();

			component.toggle();

			expect(component.isDropdownOpen()).toBeFalse();
		});

		it('should show panel when open', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			component.toggle();
			fixture.detectChanges();

			const panel = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-panel',
			);

			expect(panel).toBeTruthy();
		});

		it('should hide panel when closed', () => {
			const panel = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-panel',
			);

			expect(panel).toBeFalsy();
		});

		it('should not show edit icon when disabled', () => {
			host.disabled = true;
			fixture.detectChanges();

			const editIcon = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-edit-icon',
			);

			expect(editIcon).toBeFalsy();
		});

		it('should show edit icon when not disabled', () => {
			const editIcon = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-edit-icon',
			);

			expect(editIcon).toBeTruthy();
		});
	});

	describe('onSave', () => {
		it('should emit saveClicked and close dropdown', () => {
			host.displayDT = '1985-05-20T14:30';
			fixture.detectChanges();

			component.toggle();
			fixture.detectChanges();

			component.onSave();
			fixture.detectChanges();

			expect(host.savedValue).toBeTruthy();
			expect(component.isDropdownOpen()).toBeFalse();
		});
	});

	describe('onCancel', () => {
		it('should close dropdown and reset to input values', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			component.toggle();
			fixture.detectChanges();

			component.onDateChange({ year: '2000', month: '01', day: '15' });
			fixture.detectChanges();

			component.onCancel();
			fixture.detectChanges();

			expect(component.isDropdownOpen()).toBeFalse();
			expect(component._date().year).toBe('1985');
			expect(component._date().month).toBe('05');
		});
	});

	describe('onMoreOptions', () => {
		it('should emit moreOptionsClicked with current data', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			component.toggle();
			fixture.detectChanges();
			component.onMoreOptions();

			expect(host.moreOptionsData).toBeTruthy();
			expect(host.moreOptionsData.date.year).toBe('1985');
			expect(host.moreOptionsData.date.month).toBe('05');
		});

		it('should include end date in emitted data when present', () => {
			host.displayDT = '1985-05';
			host.displayEndDT = '1990-06';
			fixture.detectChanges();

			component.toggle();
			fixture.detectChanges();
			component.onMoreOptions();

			expect(host.moreOptionsData.endDate).toBeTruthy();
			expect(host.moreOptionsData.endDate.year).toBe('1990');
			expect(host.moreOptionsData.endDate.month).toBe('06');
		});

		it('should close dropdown when emitting', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			component.toggle();
			fixture.detectChanges();
			component.onMoreOptions();

			expect(component.isDropdownOpen()).toBeFalse();
		});
	});

	describe('outside click', () => {
		it('should close dropdown on outside click', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			component.toggle();

			expect(component.isDropdownOpen()).toBeTrue();

			const outsideEl = document.createElement('div');
			document.body.appendChild(outsideEl);

			component.onDocumentClick({
				target: outsideEl,
			} as any);

			outsideEl.remove();

			expect(component.isDropdownOpen()).toBeFalse();
		});

		it('should not close dropdown on inside click', () => {
			host.displayDT = '1985-05';
			fixture.detectChanges();

			component.toggle();
			fixture.detectChanges();

			const container = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker',
			);
			component.onDocumentClick({ target: container } as any);

			expect(component.isDropdownOpen()).toBeTrue();
		});
	});

	describe('field updates', () => {
		it('should update date on onDateChange', () => {
			component.onDateChange({ year: '2000', month: '01', day: '15' });

			expect(component._date().year).toBe('2000');
			expect(component._date().month).toBe('01');
			expect(component._date().day).toBe('15');
		});

		it('should update time on onTimeChange', () => {
			component.onTimeChange({
				hours: '10',
				minutes: '30',
				seconds: '00',
				amPm: Meridian.PM,
			});

			expect(component._time().hours).toBe('10');
			expect(component._time().minutes).toBe('30');
			expect(component._time().amPm).toBe(Meridian.PM);
		});

		it('should update timezone on onTimezoneChange', () => {
			component.onTimezoneChange({
				offset: 'GMT+01:00',
				name: 'CET',
			});

			expect(component._time().timezoneOffset).toBe('GMT+01:00');
			expect(component._time().timezoneName).toBe('CET');
		});
	});
});
