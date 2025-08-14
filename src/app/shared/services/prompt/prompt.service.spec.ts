import { TestBed } from '@angular/core/testing';

import { PromptService } from '@shared/services/prompt/prompt.service';

describe('PromptService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [PromptService],
		});
	});

	it('should be created', () => {
		const service = TestBed.inject(PromptService);

		expect(service).toBeTruthy();
	});
});
