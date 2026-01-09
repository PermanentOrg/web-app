import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { archiveOptions } from '../types/archive-types';
import { ArchiveTypeSelectDialogComponent } from './archive-type-select-dialog.component';

describe('ArchiveTypeSelectDialogComponent', () => {
	let component: ArchiveTypeSelectDialogComponent;
	let fixture: ComponentFixture<ArchiveTypeSelectDialogComponent>;
	let dialogRefSpy: jasmine.SpyObj<DialogRef>;

	beforeEach(async () => {
		dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

		await TestBed.configureTestingModule({
			imports: [ArchiveTypeSelectDialogComponent],
			providers: [{ provide: DialogRef, useValue: dialogRefSpy }],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchiveTypeSelectDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have multiple options for archive types', () => {
		const archiveTypeElements =
			fixture.nativeElement.querySelectorAll('.archive-type');

		expect(archiveTypeElements.length).toEqual(archiveOptions.length);
	});

	it('should close the dialog and return type when clicking a type', () => {
		const typeMyselfElement =
			fixture.nativeElement.querySelector('#type-myself');
		const typeOrgElement = fixture.nativeElement.querySelector('#type-org');

		typeMyselfElement.click();
		typeOrgElement.click();

		expect(dialogRefSpy.close).toHaveBeenCalledWith('type:myself');
		expect(dialogRefSpy.close).toHaveBeenCalledWith('type:org');
	});
});
