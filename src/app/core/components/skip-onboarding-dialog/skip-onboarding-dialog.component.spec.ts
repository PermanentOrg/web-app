/* @format */
import {
	ComponentFixture,
	TestBed,
	TestModuleMetadata,
} from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';
import { cloneDeep } from 'lodash';
import * as Testing from '@root/test/testbedConfig';
import { AccountService } from '@shared/services/account/account.service';
import { DialogRef } from '@angular/cdk/dialog';
import { SkipOnboardingDialogComponent } from './skip-onboarding-dialog.component';

class MockDialogRef {
	close() {}
}

describe('SkipOnboardingDialogComponent', () => {
	let component: SkipOnboardingDialogComponent;
	let fixture: ComponentFixture<SkipOnboardingDialogComponent>;
	let dialogRef: DialogRef;

	const mockAccountService = {
		getAccount: jasmine
			.createSpy('getAccount')
			.and.returnValue({ fullName: 'Mocked Name' }),
	};

	beforeEach(async () => {
		const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.imports.push(SharedModule);
		config.declarations.push(SkipOnboardingDialogComponent);
		config.providers.push(
			{ provide: DialogRef, useClass: MockDialogRef },
			{ provide: AccountService, useValue: mockAccountService },
		);

		await TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(SkipOnboardingDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
