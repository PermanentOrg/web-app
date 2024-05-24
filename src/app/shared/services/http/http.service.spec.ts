/* @format */
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpService } from '@shared/services/http/http.service';
import { StorageService } from '../storage/storage.service';

describe('HttpService', () => {
  let service: HttpService;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService, StorageService],
    });
    service = TestBed.inject(HttpService);
    storage = TestBed.inject(StorageService);
    storage.local.clear();
  });

  afterAll(() => {
    storage.local.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not make Authorization headers by default', () => {
    const headers = service.generateHeaders();

    expect(headers.keys().length).toBe(0);
  });

  it('should make Authorization headers if an auth token is set', () => {
    storage.local.set('AUTH_TOKEN', 'testing_token');
    const headers = service.generateHeaders({ useAuthorizationHeader: true });

    expect(headers.keys().length).toBe(1);
    expect(headers.get('Authorization')).toBe('Bearer testing_token');
  });

  it('should not make Authorization headers if not specified by options parameter', () => {
    storage.local.set('AUTH_TOKEN', 'testing_token');

    expect(service.generateHeaders().keys().length).toBe(0);
    expect(service.generateHeaders({}).keys().length).toBe(0);
    expect(
      service.generateHeaders({ useAuthorizationHeader: false }).keys().length
    ).toBe(0);
  });
});
