import { TestBed } from '@angular/core/testing';

import { ChecklistAnalyticsObserverService } from './checklist-analytics-observer.service';

describe('ChecklistAnalyticsObserverService', () => {
  let service: ChecklistAnalyticsObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChecklistAnalyticsObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert update() calls to a Subject.next() call', (done) => {
    service.getSubject().subscribe(() => {
      done();
    });

    service.update({
      action: 'initiate_upload',
      entity: 'record',
      version: 1,
      entityId: 'test',
      body: {},
    });
  });
});
