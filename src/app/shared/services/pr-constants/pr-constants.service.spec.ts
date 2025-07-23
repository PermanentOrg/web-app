import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

const CONSTANTS = require('../../../../../constants/master_en.json');

describe('PrConstantsService', () => {
	let service: PrConstantsService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [PrConstantsService],
		});

		service = TestBed.get(PrConstantsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should contain the data JSON', () => {
		expect(service.getConstants()).toBeTruthy();
	});

	it('should translate a constants string', () => {
		const translateString = 'warning.auth.token_does_not_match';

		expect(service.translate(translateString)).toEqual(
			CONSTANTS.warning.auth.token_does_not_match,
		);
	});

	it('should return the original string if not found', () => {
		const translateString = 'fake.translate.string';

		expect(service.translate(translateString)).toEqual(translateString);
	});
});
