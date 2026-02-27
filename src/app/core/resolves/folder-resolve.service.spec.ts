import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';

describe('FolderResolveService', () => {
	let service: FolderResolveService;

	beforeEach(() => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.providers.push(FolderResolveService);
		TestBed.configureTestingModule(config);
		service = TestBed.inject(FolderResolveService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
