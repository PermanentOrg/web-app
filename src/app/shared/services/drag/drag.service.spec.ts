import { TestBed } from '@angular/core/testing';

import { BASE_TEST_CONFIG } from '@root/test/testbedConfig';
import { DragService } from './drag.service';

describe('DragService', () => {
	let service: DragService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [...BASE_TEST_CONFIG.imports],
			providers: [...BASE_TEST_CONFIG.providers, DragService],
		});
		service = TestBed.inject(DragService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
