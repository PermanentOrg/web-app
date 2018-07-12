import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpService } from '../http/http.service';
import { BaseRepo } from './base';

describe('BaseRepo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [HttpService]
    });
  });

  it('should be initialized with HttpService ', inject([HttpService], (http: HttpService) => {
    const authRepo = new BaseRepo(http);
    expect(authRepo.http).toEqual(jasmine.any(HttpService));
  }));
});
