import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { By } from '@angular/platform-browser';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { ArchiveVO } from '@root/app/models';
import { TEST_DATA } from '@core/core.module.spec';
import { AccountService } from '@shared/services/account/account.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { ArchiveSmallComponent } from './archive-small.component';

describe('ArchiveSmallComponent', () => {
	let component: ArchiveSmallComponent;
	let fixture: ComponentFixture<ArchiveSmallComponent>;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.declarations.push(ArchiveSmallComponent);
		config.declarations.push(BgImageSrcDirective);

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

	it('should read the thumbnail currently on the archive', () => {
		expect(component.archiveThumbnail).toBeUndefined();

		component.archive.thumbURL200 = 'https://example.com/200';

		expect(component.archiveThumbnail).toBe('https://example.com/200');
	});

	it('should not read a thumbnail when no archive is bound', () => {
		// The archive input defaults to null, so the getter has to tolerate being
		// read before a caller binds one.
		component.archive = null;

		expect(component.archiveThumbnail).toBeUndefined();
	});

	it('should show a profile photo written onto the archive after it is rendered', () => {
		const background = fixture.debugElement
			.query(By.directive(BgImageSrcDirective))
			.injector.get(BgImageSrcDirective);

		expect(background.bgSrc).toBeFalsy();

		// promptForProfilePicture() writes the new URLs onto this same instance, so
		// the avatar has to notice a mutation that leaves the reference unchanged.
		component.archive.thumbURL200 = 'https://example.com/thumb.jpg';
		fixture.detectChanges();

		expect(background.bgSrc).toBe('https://example.com/thumb.jpg');
	});
});
