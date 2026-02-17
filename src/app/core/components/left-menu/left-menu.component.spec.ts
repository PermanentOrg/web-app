import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { AccountService } from '@shared/services/account/account.service';
import { TEST_DATA } from '@core/core.module.spec';
import { ArchiveSmallComponent } from '@shared/components/archive-small/archive-small.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { AccountVO, ArchiveVO } from '@models';
import { PrConstantsPipe } from '@shared/pipes/pr-constants.pipe';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { ArchiveStoragePayerComponent } from '@core/components/archive-storage-payer/archive-storage-payer.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GetThumbnailPipe } from '@shared/pipes/get-thumbnail.pipe';

describe('LeftMenuComponent', () => {
	let component: LeftMenuComponent;
	let fixture: ComponentFixture<LeftMenuComponent>;
	let accountService: AccountService;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.declarations.push(LeftMenuComponent);
		config.declarations.push(ArchiveSmallComponent);
		config.declarations.push(BgImageSrcDirective);
		config.declarations.push(PrConstantsPipe);
		config.declarations.push(ArchiveStoragePayerComponent);
		config.declarations.push(GetThumbnailPipe);
		config.imports.push(NgbTooltipModule);
		config.imports.push(NoopAnimationsModule);

		TestBed.configureTestingModule(config).compileComponents();

		accountService = TestBed.inject(AccountService);
		accountService.setAccount(new AccountVO(TEST_DATA.account));
		accountService.setArchive(new ArchiveVO(TEST_DATA.archive));

		fixture = TestBed.createComponent(LeftMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		accountService.clearAccount();
		accountService.clearArchive();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have the current archive name as a property', () => {
		expect(component.archive.fullName).toEqual(TEST_DATA.archive.fullName);
	});

	it('should show the pr-archive-storage-payer component if payer is defined', fakeAsync(() => {
		const payer = new AccountVO({ accountId: 1 });
		const showArchiveOptions = true;
		component.payer = payer;
		component.showArchiveOptions = showArchiveOptions;

		fixture.detectChanges();

		const prArchiveStoragePayerDebugElement = fixture.debugElement.query(
			By.directive(ArchiveStoragePayerComponent),
		);

		expect(prArchiveStoragePayerDebugElement).toBeTruthy();
	}));

	it('should not show the pr-archive-storage-payer component if payer is undefined', () => {
		const payer = undefined;
		const showArchiveOptions = true;
		component.payer = payer;
		component.showArchiveOptions = showArchiveOptions;

		fixture.detectChanges();

		const prArchiveStoragePayerDebugElement = fixture.debugElement.query(
			By.directive(ArchiveStoragePayerComponent),
		);

		expect(prArchiveStoragePayerDebugElement).toBeFalsy();
	});
});
