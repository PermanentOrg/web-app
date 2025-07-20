import { TestBed, inject } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpService } from '@shared/services/http/http.service';
import { BaseRepo } from '@shared/services/api/base';

describe('BaseRepo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [HttpService, provideHttpClient(withInterceptorsFromDi())],
    });
  });

  it('should be initialized with HttpService ', inject(
    [HttpService],
    (http: HttpService) => {
      const authRepo = new BaseRepo(http);

      expect(authRepo.http).toEqual(jasmine.any(HttpService));
    },
  ));
});
