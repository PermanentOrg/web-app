import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';

describe('FolderResolveService', () => {
	beforeEach(() => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		const providers = config.providers as any[];
		providers.push(FolderResolveService);
		TestBed.configureTestingModule(config);
	});

	it('should be created', () => {
		const service = TestBed.inject(FolderResolveService);

		expect(service).toBeTruthy();
	});
});
