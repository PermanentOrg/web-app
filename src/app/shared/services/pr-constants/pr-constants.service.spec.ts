import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { PrConstantsService } from './pr-constants.service';

fdescribe('PrConstantsService', () => {
  let service: PrConstantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrConstantsService]
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
    expect(service.translate(translateString)).toEqual('The verification token entered is not valid. Please re-enter verification token.');
  });

  it('should return the original string if not found', () => {
    const translateString = 'fake.translate.string';
    expect(service.translate(translateString)).toEqual(translateString);
  });
});
