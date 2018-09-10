import { TestBed, inject } from '@angular/core/testing';

import { PromptService } from '@core/services/prompt/prompt.service';

xdescribe('PromptService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PromptService]
    });
  });

  it('should be created', inject([PromptService], (service: PromptService) => {
    expect(service).toBeTruthy();
  }));
});
