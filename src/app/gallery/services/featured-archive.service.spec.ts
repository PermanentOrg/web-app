/* @format */
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { environment } from '@root/environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FeaturedArchive } from '../types/featured-archive';
import { FeaturedArchiveService } from './featured-archive.service';

describe('FeaturedArchiveService', () => {
  let service: FeaturedArchiveService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [HttpV2Service, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(FeaturedArchiveService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can fetch featured archives', () => {
    const expected: FeaturedArchive[] = [
      {
        archiveNbr: '0001-0000',
        bannerImage: 'image.jpg',
        name: 'Unit Test',
        profileImage: 'image.jpg',
        type: 'type.archive.person',
      },
    ];

    service.getFeaturedArchiveList().then((archives) => {
      expect(archives.length).toBe(1);
      expect(archives[0].name).toBe('Unit Test');
    });

    const req = http.expectOne(`${environment.apiUrl}/v2/archive/featured`);

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    req.flush(expected);
  });
});
