import {
	ComponentFixture,
	TestBed,
	TestModuleMetadata,
} from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { cloneDeep } from 'lodash';
import { SharedModule } from '../../../shared/shared.module';
import { ConfirmPayerDialogComponent } from './confirm-payer-dialog.component';

import { vi } from 'vitest';

class MockDialogRef {
	close() {}
}

describe('ConfirmPayerDialogComponent', () => {
	let component: ConfirmPayerDialogComponent;
	let fixture: ComponentFixture<ConfirmPayerDialogComponent>;
	let dialogRef: MockDialogRef;
	let cancelAccountPayerSet: any;
	let handleAccountInfoChange: any;

	beforeEach(async () => {
		handleAccountInfoChange = vi.fn();
		cancelAccountPayerSet = vi.fn();
		const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.imports.push(SharedModule);
		config.declarations.push(ConfirmPayerDialogComponent);
		config.providers.push({
			provide: DIALOG_DATA,
			useValue: {
				archiveId: 1,
				isPayerDifferentThanLoggedUser: false,
				handleAccountInfoChange,
				cancelAccountPayerSet,
			},
		});
		config.providers.push({
			provide: DialogRef,
			useClass: MockDialogRef,
		});
		await TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(ConfirmPayerDialogComponent);
		component = fixture.componentInstance;
		dialogRef = TestBed.inject(DialogRef) as unknown as MockDialogRef;
		vi.spyOn(dialogRef, 'close').mockRestore();
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should close the dialog when onDoneClick is called', () => {
		component.onDoneClick();

		expect(cancelAccountPayerSet).toHaveBeenCalled();
		expect(dialogRef.close).toHaveBeenCalled();
	});

	it('should close the dialog when onConfrmClick is called', () => {
		component.onConfirmClick();

		expect(handleAccountInfoChange).toHaveBeenCalledWith(true);
		expect(dialogRef.close).toHaveBeenCalled();
	});
});
