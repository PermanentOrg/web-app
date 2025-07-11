/* @format */
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { environment } from '@root/environments/environment';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { ArchiveVO } from '@models/index';
import { ChecklistApiResponse } from '../types/checklist-item';
import { UserChecklistService } from './user-checklist.service';
import { ChecklistEventObserverService } from './checklist-event-observer.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UserChecklistService', () => {
  let service: UserChecklistService;
  let http: HttpTestingController;
  let account: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [HttpV2Service, AccountService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(UserChecklistService);
    http = TestBed.inject(HttpTestingController);
    account = TestBed.inject(AccountService);
    account.clear();
    TestBed.inject(HttpV2Service).setAuthToken('test');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can fetch the checklist contents', (done) => {
    const expected: ChecklistApiResponse = {
      checklistItems: [
        {
          id: 'test_item',
          title: 'Test the checklist API service',
          completed: true,
        },
      ],
    };

    service
      .getChecklistItems()
      .then((items) => {
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(expected.checklistItems[0]);
        done();
      })
      .catch(() => {
        done.fail();
      });

    const req = http.expectOne(`${environment.apiUrl}/v2/event/checklist`);

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    expect(req.request.headers.get('Authorization')).not.toBeNull();
    req.flush(expected);
  });

  it('can check if the user is hiding the checklist', () => {
    account.setAccount(new AccountVO({ hideChecklist: false }));

    expect(service.isAccountHidingChecklist()).toBeFalse();

    account.setAccount(new AccountVO({ hideChecklist: true }));

    expect(service.isAccountHidingChecklist()).toBeTrue();
  });

  it('will hide the checklist if the account is not set', () => {
    account.clear();

    expect(service.isAccountHidingChecklist()).toBeTrue();
  });

  it('can check if the current account has Owner access to the current archive', () => {
    account.setAccount(
      new AccountVO({ hideChecklist: false, defaultArchiveId: 1 }),
    );

    account.setArchive(
      new ArchiveVO({ accessRole: 'access.role.viewer', archiveId: 1 }),
    );

    expect(service.isDefaultArchiveOwnedByAccount()).toBeFalse();

    account.setArchive(
      new ArchiveVO({ accessRole: 'access.role.owner', archiveId: 1 }),
    );

    expect(service.isDefaultArchiveOwnedByAccount()).toBeTrue();
  });

  it('will also check if the current account has the current archive as its default', () => {
    account.setAccount(
      new AccountVO({ hideChecklist: false, defaultArchiveId: 12345 }),
    );

    account.setArchive(
      new ArchiveVO({ accessRole: 'access.role.owner', archiveId: 98765 }),
    );

    expect(service.isDefaultArchiveOwnedByAccount()).toBeFalse();
  });

  it('can update the current account to hide the checklist', (done) => {
    account.setAccount(new AccountVO({ hideChecklist: false }));

    service
      .setChecklistHidden()
      .catch(() => {
        done.fail();
      })
      .finally(() => {
        done();
      });

    const req = http.expectOne(`${environment.apiUrl}/account/update`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body.hideChecklist).toBeTrue();
    req.flush({
      hideChecklist: true,
    });
  });

  it('binds its recheck archive event to the accountservice', (done) => {
    service.getArchiveChangedEvent().subscribe(() => {
      service.getArchiveChangedEvent().unsubscribe();
      done();
    });

    account.archiveChange.next(new ArchiveVO({}));
  });

  it('unsubscribes from the accountservice when it is destroyed', (done) => {
    service.getArchiveChangedEvent().subscribe(() => {
      done.fail('Service is still subscribed to AccountService');
    });

    service.ngOnDestroy();

    account.archiveChange.next(new ArchiveVO({}));
    setTimeout(() => {
      done();
    }, 1);
  });

  it('binds to the checklist analytics observer service', (done) => {
    service.getRefreshChecklistEvent().subscribe(() => {
      done();
    });

    TestBed.inject(ChecklistEventObserverService).update({
      action: 'initiate_upload',
      entity: 'account',
    });
  });
});
