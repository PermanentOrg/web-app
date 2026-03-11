import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { ArchiveVO } from '@root/app/models';
import { TEST_DATA } from '@core/core.module.spec';
import { AccountService } from '@shared/services/account/account.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { GetThumbnailPipe } from '@shared/pipes/get-thumbnail.pipe';
import { ArchiveSmallComponent } from './archive-small.component';

describe('ArchiveSmallComponent', () => {
	let component: ArchiveSmallComponent;
	let fixture: ComponentFixture<ArchiveSmallComponent>;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.declarations.push(ArchiveSmallComponent);
		config.declarations.push(BgImageSrcDirective);
		config.declarations.push(GetThumbnailPipe);

		TestBed.configureTestingModule(config).compileComponents();

		const currentArchive = new ArchiveVO(TEST_DATA.archive);
		const accountService = TestBed.inject(AccountService) as AccountService;
		accountService.setArchive(currentArchive);

		fixture = TestBed.createComponent(ArchiveSmallComponent);
		component = fixture.componentInstance;
		component.archive = currentArchive;
		fixture.detectChanges();
	});

	afterEach(() => {
		const storage = TestBed.inject(StorageService) as StorageService;
		storage.local.clear();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
