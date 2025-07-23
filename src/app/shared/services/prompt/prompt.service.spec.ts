import { TestBed, inject } from '@angular/core/testing';

import { PromptService } from '@shared/services/prompt/prompt.service';

describe('PromptService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [PromptService],
		});
	});

	it('should be created', inject([PromptService], (service: PromptService) => {
		expect(service).toBeTruthy();
	}));
});
