import { TestBed } from '@angular/core/testing';

import { IFrameService } from './iframe.service';

describe('IFrameService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: IFrameService = TestBed.inject(IFrameService);

		expect(service).toBeTruthy();
	});
});
