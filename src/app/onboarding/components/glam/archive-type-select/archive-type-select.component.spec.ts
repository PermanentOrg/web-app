import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { OnboardingTypes } from '@root/app/onboarding/shared/onboarding-screen';
import { archiveDescriptions } from '../types/archive-types';
import { GlamArchiveTypeSelectComponent } from './archive-type-select.component';

describe('ArchiveTypeSelectComponent', () => {
	let component: GlamArchiveTypeSelectComponent;
	let fixture: ComponentFixture<GlamArchiveTypeSelectComponent>;
	let dialogRef: Subject<OnboardingTypes | undefined>;
	let mockDialogService: { open: jasmine.Spy };

	function expectCommunityDisplayed() {
		const typeNameElement = fixture.nativeElement.querySelector('.type-name');
		const typeDescriptionElement =
			fixture.nativeElement.querySelector('.type-description');

		expect(typeNameElement.innerText).toContain('Community');
		expect(typeDescriptionElement.innerText).toContain(
			archiveDescriptions['type:community'],
		);
	}

	beforeEach(async () => {
		if (dialogRef) {
			dialogRef.complete();
		}
		dialogRef = new Subject<OnboardingTypes | undefined>();
		mockDialogService = {
			open: jasmine.createSpy('open').and.returnValue({
				closed: dialogRef,
			}),
		};

		await TestBed.configureTestingModule({
			imports: [GlamArchiveTypeSelectComponent],
			providers: [{ provide: DialogCdkService, useValue: mockDialogService }],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(GlamArchiveTypeSelectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open a selection dialog on click', () => {
		component.onClick();

		expect(mockDialogService.open).toHaveBeenCalled();
	});

	it('should change displayed archive type when the dialog returns with a type', () => {
		component.onClick();
		dialogRef.next(OnboardingTypes.community);
		fixture.detectChanges();

		expectCommunityDisplayed();
	});

	it('can change type multiple times', () => {
		component.onClick();
		dialogRef.next(OnboardingTypes.famhist);
		component.onClick();
		dialogRef.next(OnboardingTypes.community);
		fixture.detectChanges();

		expectCommunityDisplayed();
	});

	it('should not change the displayed archive type if the dialog is closed without any selection', () => {
		component.onClick();
		dialogRef.next(OnboardingTypes.community);
		component.onClick();
		dialogRef.next(undefined);

		fixture.detectChanges();

		expectCommunityDisplayed();
	});

	it('handles an invalid onboardingtype', () => {
		component.onClick();
		dialogRef.next(OnboardingTypes.community);
		component.onClick();
		dialogRef.next('not-valid-type' as OnboardingTypes);

		fixture.detectChanges();

		expectCommunityDisplayed();
	});

	it('emits the selected archive type', () => {
		spyOn(component.typeSelected, 'emit');
		component.onClick();
		dialogRef.next(OnboardingTypes.famhist);

		expect(component.typeSelected.emit).toHaveBeenCalledWith(
			OnboardingTypes.famhist,
		);
	});
});
