import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { ArchiveResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { SharedModule } from '@shared/shared.module';
import { ArchiveVO } from '@root/app/models';
import { ActivatedRoute } from '@angular/router';
import { AllArchivesComponent } from './all-archives.component';

const archiveResponseData = require('@root/test/responses/archive.get.multiple.success.json');

describe('AllArchivesComponent', () => {
	let component: AllArchivesComponent;
	let fixture: ComponentFixture<AllArchivesComponent>;

	const archiveResponse = new ArchiveResponse(archiveResponseData);
	const archives = archiveResponse.getArchiveVOs();
	const currentArchive = new ArchiveVO(archives.pop());

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.imports.push(SharedModule);
		config.declarations.push(AllArchivesComponent);

		config.providers.push({
			provide: ActivatedRoute,
			useValue: {
				snapshot: {
					data: {
						archives,
					},
				},
			},
		});
		TestBed.configureTestingModule(config).compileComponents();

		const accountService = TestBed.inject(AccountService) as AccountService;
		accountService.setArchive(currentArchive);

		fixture = TestBed.createComponent(AllArchivesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		const accountService = TestBed.inject(AccountService) as AccountService;
		accountService.clearArchive();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
