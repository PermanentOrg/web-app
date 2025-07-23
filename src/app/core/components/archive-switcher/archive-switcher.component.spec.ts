import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { SharedModule } from '@shared/shared.module';
import { ArchiveVO } from '@root/app/models';
import { ActivatedRoute } from '@angular/router';
import { ArchiveSwitcherComponent } from './archive-switcher.component';

const archiveResponseData = require('@root/test/responses/archive.get.multiple.success.json');

describe('ArchiveSwitcherComponent', () => {
	let component: ArchiveSwitcherComponent;
	let fixture: ComponentFixture<ArchiveSwitcherComponent>;

	const archiveResponse = new ArchiveResponse(archiveResponseData);
	const archives = archiveResponse.getArchiveVOs();
	const currentArchive = new ArchiveVO(archives.pop());

	beforeEach(waitForAsync(() => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.imports.push(SharedModule);
		config.declarations.push(ArchiveSwitcherComponent);

		config.providers.push({
			provide: ActivatedRoute,
			useValue: {
				snapshot: {
					data: {
						archives: archives,
					},
				},
			},
		});
		TestBed.configureTestingModule(config).compileComponents();
	}));

	beforeEach(() => {
		const accountService = TestBed.get(AccountService) as AccountService;
		accountService.setArchive(currentArchive);

		fixture = TestBed.createComponent(ArchiveSwitcherComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		const accountService = TestBed.get(AccountService) as AccountService;
		accountService.clearArchive();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have the correct number of archives listed', () => {
		expect(component.archives.length).toEqual(archives.length);

		const element = fixture.debugElement.nativeElement as HTMLElement;

		expect(
			element.querySelectorAll('.archive-list pr-archive-small').length,
		).toEqual(component.archives.length);
	});
});
