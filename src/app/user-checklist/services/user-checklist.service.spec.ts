/* @format */
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { environment } from '@root/environments/environment';
import { ChecklistItem } from '../types/checklist-item';
import { UserChecklistService } from './user-checklist.service';

describe('UserChecklistService', () => {
  let service: UserChecklistService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpV2Service],
    });
    service = TestBed.inject(UserChecklistService);
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(HttpV2Service).setAuthToken('test');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can fetch the checklist contents', (done) => {
    const expected: ChecklistItem[] = [
      {
        id: 'test_item',
        title: 'Test the checklist API service',
        completed: true,
      },
    ];

    service
      .getChecklistItems()
      .then((items) => {
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(expected[0]);
      })
      .finally(() => {
        done();
      });

    const req = http.expectOne(`${environment.apiUrl}/v2/event/checklist`);

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    expect(req.request.headers.get('Authorization')).not.toBeNull();
    req.flush(expected);
  });
});
