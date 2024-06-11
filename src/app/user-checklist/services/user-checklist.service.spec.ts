/* @format */
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { environment } from '@root/environments/environment';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { ArchiveVO } from '@models/index';
import { ChecklistItem } from '../types/checklist-item';
import { UserChecklistService } from './user-checklist.service';

describe('UserChecklistService', () => {
  let service: UserChecklistService;
  let http: HttpTestingController;
  let account: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpV2Service, AccountService],
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
    account.setAccount(new AccountVO({ hideChecklist: false }));

    account.setArchive(new ArchiveVO({ accessRole: 'access.role.viewer' }));

    expect(service.isArchiveOwnedByAccount()).toBeFalse();

    account.setArchive(new ArchiveVO({ accessRole: 'access.role.owner' }));

    expect(service.isArchiveOwnedByAccount()).toBeTrue();
  });
});
