import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { DateTimeModel } from '@shared/services/edtf-service/edtf.service';
import { SidebarDatePickerComponent } from './sidebar-date-picker.component';

@Component({
	template: `
		<pr-sidebar-date-picker
			[displayTime]="displayTime"
			[disabled]="disabled"
			(saveClicked)="onSaveClicked($event)"
			(moreOptionsClicked)="onMoreOptionsClicked($event)"
		/>
	`,
	standalone: false,
})
class TestHostComponent {
	displayTime: DateTimeModel | null = null;
	disabled = false;
	savedValue: DateTimeModel | null = null;
	moreOptionsData: DateTimeModel | null = null;

	onSaveClicked(value: DateTimeModel) {
		this.savedValue = value;
	}
	onMoreOptionsClicked(data: DateTimeModel) {
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

		it('should display formatted date when displayTime is set', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			const value = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-value',
			);

			expect(value).toBeTruthy();
			expect(value.textContent.trim()).toBe('May 1985');
		});

		it('should display year-only date', () => {
			host.displayTime = {
				date: { year: '1985', month: '', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			const value = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-value',
			);

			expect(value.textContent.trim()).toBe('1985');
		});

		it('should display full date with day', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '20' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			const value = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-value',
			);

			expect(value.textContent.trim()).toBe('May 20, 1985');
		});

		it('should display date with time', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '20' },
				time: {
					hours: '02',
					minutes: '30',
					seconds: '00',
					am: false,
					pm: true,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			const value = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-value',
			);

			expect(value.textContent).toContain('May 20, 1985');
			expect(value.textContent).toContain('2:30:00');
			expect(value.textContent).toContain('PM');
		});

		it('should display xxxx-xx-xx when unknown qualifier is set', () => {
			host.displayTime = {
				qualifiers: { approximate: false, uncertain: false, unknown: true },
				date: { year: '', month: '', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			const value = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-row-value',
			);

			expect(value.textContent).toContain('xxxx-xx-xx');
		});

		it('should not show To row when no end date', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			const toRow = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-to-row',
			);

			expect(toRow).toBeFalsy();
		});

		it('should show To row when end date is set', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
				endDate: { year: '1990', month: '06', day: '' },
				endTime: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
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
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			const qualifiers = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-qualifiers',
			);

			expect(qualifiers).toBeFalsy();
		});

		it('should display Approximate qualifier', () => {
			host.displayTime = {
				qualifiers: { approximate: true, uncertain: false, unknown: false },
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			const qualifiers = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-qualifiers',
			);

			expect(qualifiers).toBeTruthy();
			expect(qualifiers.textContent).toContain('Approximate');
		});

		it('should display Uncertain qualifier', () => {
			host.displayTime = {
				qualifiers: { approximate: false, uncertain: true, unknown: false },
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			const qualifiers = fixture.nativeElement.querySelector(
				'.pr-sidebar-date-picker-qualifiers',
			);

			expect(qualifiers).toBeTruthy();
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
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			component.toggle();

			expect(component.isDropdownOpen()).toBeTrue();
		});

		it('should close dropdown on second toggle', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			component.toggle();

			expect(component.isDropdownOpen()).toBeTrue();

			component.toggle();

			expect(component.isDropdownOpen()).toBeFalse();
		});

		it('should open modal instead of dropdown when end date is present', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
				endDate: { year: '1990', month: '06', day: '' },
				endTime: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			component.toggle();

			expect(component.isDropdownOpen()).toBeFalse();
			expect(host.moreOptionsData).toBeTruthy();
		});

		it('should open modal instead of dropdown when unknown qualifier is set', () => {
			host.displayTime = {
				qualifiers: { approximate: false, uncertain: false, unknown: true },
				date: { year: '', month: '', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			component.toggle();

			expect(component.isDropdownOpen()).toBeFalse();
			expect(host.moreOptionsData).toBeTruthy();
		});
	});

	describe('clearAll', () => {
		it('should clear all fields but keep dropdown open', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '20' },
				time: {
					hours: '10',
					minutes: '30',
					seconds: '00',
					am: true,
					pm: false,
					timezoneOffset: 'GMT+01:00',
					timezoneName: 'CET',
				},
			};
			fixture.detectChanges();

			component.open();
			component.clearAll();

			expect(component._date().year).toBe('');
			expect(component._time().hours).toBe('');
			expect(component._qualifiers().unknown).toBeFalse();
			expect(component.isDropdownOpen()).toBeTrue();
		});
	});

	describe('onSave', () => {
		it('should emit saveClicked and close dropdown', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '20' },
				time: {
					hours: '02',
					minutes: '30',
					seconds: '00',
					am: false,
					pm: true,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
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
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
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
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			component.toggle();
			fixture.detectChanges();
			component.onMoreOptions();

			expect(host.moreOptionsData).toBeTruthy();
			expect(host.moreOptionsData.date.year).toBe('1985');
			expect(host.moreOptionsData.date.month).toBe('05');
		});

		it('should close dropdown when emitting', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			component.toggle();
			fixture.detectChanges();
			component.onMoreOptions();

			expect(component.isDropdownOpen()).toBeFalse();
		});
	});

	describe('outside click', () => {
		it('should close dropdown on outside click', () => {
			host.displayTime = {
				date: { year: '1985', month: '05', day: '' },
				time: {
					hours: '',
					minutes: '',
					seconds: '',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				},
			};
			fixture.detectChanges();

			component.toggle();

			expect(component.isDropdownOpen()).toBeTrue();

			const outsideEl = document.createElement('div');
			document.body.appendChild(outsideEl);

			component.onDocumentClick({ target: outsideEl } as any);
			outsideEl.remove();

			expect(component.isDropdownOpen()).toBeFalse();
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
				am: false,
				pm: true,
			});

			expect(component._time().hours).toBe('10');
			expect(component._time().minutes).toBe('30');
			expect(component._time().pm).toBe(true);
		});

		it('should update timezone on onTimezoneChange', () => {
			component.onTimezoneChange({
				offset: 'GMT+01:00',
				name: 'Central European Standard Time',
			});

			expect(component._time().timezoneOffset).toBe('GMT+01:00');
			expect(component._time().timezoneName).toBe(
				'Central European Standard Time',
			);
		});
	});
});
