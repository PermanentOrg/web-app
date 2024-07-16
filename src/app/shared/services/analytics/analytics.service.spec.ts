import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';
import { AccountVO } from '@models/account-vo';
import { Directive, FolderType, FolderVO, RecordVO } from '@models/index';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { StorageService } from '../storage/storage.service';
import { DeviceService } from '../device/device.service';
import { DataService } from '../data/data.service';
import { AccountService } from '../account/account.service';
import { EventService } from '../event/event.service';
import {
  AccountEvent,
  AccountEventAction,
  DirectiveAction,
  DirectiveEvent,
  LegacyContactAction,
  LegacyContactEvent,
  PermanentEvent,
} from '../event/event-types';
import { AnalyticsService, MixpanelData } from './analytics.service';

class MockDeviceMobileWidth {
  private mobileWidth: boolean = false;

  public setMobileWidth(mobile: boolean): void {
    this.mobileWidth = mobile;
  }

  public isMobileWidth(): boolean {
    return this.mobileWidth;
  }
}

class MockDataCurrentFolder {
  public currentFolder = new FolderVO({ type: 'type.folder.private' });

  public setCurrentFolderType(type: FolderType): void {
    this.currentFolder.type = type;
  }
}

class MockAccountId {
  private account: AccountVO | undefined;

  public setAccount(account: AccountVO) {
    this.account = account;
  }

  public getAccount(): AccountVO | undefined {
    return this.account;
  }
}

describe('AnalyticsService Integration Tests', () => {
  let event: EventService;
  let http: HttpTestingController;
  let device: MockDeviceMobileWidth;
  let data: MockDataCurrentFolder;
  let account: MockAccountId;

  function expectInputEventMatchesMixpanelData(
    inputEvent: PermanentEvent,
    expected: MixpanelData,
  ) {
    event.dispatch(inputEvent);

    const req = http.expectOne(`${environment.apiUrl}/v2/event`);

    expect(req.request.body).toEqual(expected);

    req.flush({});
  }

  function expectNoAnalyticsCall(input: PermanentEvent) {
    event.dispatch(input);

    http.expectNone(`${environment.apiUrl}/v2/event`);
  }

  function createAccountEvent(action: AccountEventAction): AccountEvent {
    return {
      entity: 'account',
      action,
      account: new AccountVO({ accountId: 1 }),
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpV2Service,
        EventService,
        AnalyticsService,
        StorageService,
        {
          provide: DeviceService,
          useClass: MockDeviceMobileWidth,
        },
        {
          provide: DataService,
          useClass: MockDataCurrentFolder,
        },
        {
          provide: AccountService,
          useClass: MockAccountId,
        },
      ],
    });
    event = TestBed.inject(EventService);
    http = TestBed.inject(HttpTestingController);
    device = TestBed.inject(DeviceService) as any as MockDeviceMobileWidth;
    data = TestBed.inject(DataService) as any as MockDataCurrentFolder;
    account = TestBed.inject(AccountService) as any as MockAccountId;
    event.addObserver(TestBed.inject(AnalyticsService));
    localStorage.setItem('account', JSON.stringify({ accountId: '1' }));
    environment.analyticsDebug = false;
    device.setMobileWidth(false);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('account');
  });

  it('exists', () => {
    expect(event).not.toBeUndefined();
  });

  it('VerifyComponent', () => {
    const expected: MixpanelData = {
      entity: 'account',
      action: 'open_verify_email',
      version: 1,
      entityId: '1',
      body: {
        analytics: {
          event: 'Verify Email',
          data: {},
        },
      },
    };
    expectInputEventMatchesMixpanelData(
      createAccountEvent('open_verify_email'),
      expected,
    );
  });

  it('AccountSettingsComponent', () => {
    const expected: MixpanelData = {
      action: 'open_login_info',
      entity: 'account',
      version: 1,
      entityId: '1',
      body: {
        analytics: {
          event: 'View Login Info',
          data: {
            page: 'Login info',
          },
        },
      },
    };
    expectInputEventMatchesMixpanelData(
      createAccountEvent('open_login_info'),
      expected,
    );
  });

  it('BillingSettingsComponent', () => {
    const expected: MixpanelData = {
      action: 'open_billing_info',
      entity: 'account',
      version: 1,
      entityId: '1',
      body: {
        analytics: {
          event: 'View Billing Info',
          data: {
            page: 'Billing Info',
          },
        },
      },
    };
    expectInputEventMatchesMixpanelData(
      createAccountEvent('open_billing_info'),
      expected,
    );
  });

  describe('OpenArchiveMenu', () => {
    /*
    Includes calls from:
    - LeftMenuComponent
    - NavComponent
    */

    function getExpected(event: 'Page View' | 'Screen View'): MixpanelData {
      return {
        entity: 'account',
        action: 'open_archive_menu',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event,
            data: { page: 'Archive Menu' },
          },
        },
      };
    }

    it('Desktop', () => {
      device.setMobileWidth(false);
      const expected = getExpected('Page View');
      expectInputEventMatchesMixpanelData(
        createAccountEvent('open_archive_menu'),
        expected,
      );
    });

    it('Mobile', () => {
      device.setMobileWidth(true);
      const expected = getExpected('Screen View');
      expectInputEventMatchesMixpanelData(
        createAccountEvent('open_archive_menu'),
        expected,
      );
    });
  });

  describe('ProfileEditComponent', () => {
    function getExpected(pageView: 'Page View' | 'Screen View'): MixpanelData {
      return {
        entity: 'account',
        action: 'open_archive_profile',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: pageView,
            data: {
              page: 'Archive Profile',
            },
          },
        },
      };
    }

    it('Load - Desktop', () => {
      device.setMobileWidth(false);
      const expected = getExpected('Page View');
      expectInputEventMatchesMixpanelData(
        createAccountEvent('open_archive_profile'),
        expected,
      );
    });

    it('Load - Mobile', () => {
      device.setMobileWidth(true);
      const expected = getExpected('Screen View');
      expectInputEventMatchesMixpanelData(
        createAccountEvent('open_archive_profile'),
        expected,
      );
    });

    it('Update ProfileItem', () => {
      const expected: MixpanelData = {
        action: 'update',
        entity: 'profile_item',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: 'Edit Archive Profile',
            data: {},
          },
        },
      };
      expectInputEventMatchesMixpanelData(
        {
          entity: 'profile_item',
          action: 'update',
          profileItem: {
            profile_itemId: 1,
          },
        },
        expected,
      );
    });
  });

  describe('StorageDialogComponent', () => {
    function getExpected(pageView: 'Page View' | 'Screen View'): MixpanelData {
      return {
        action: 'open_promo_entry',
        entity: 'account',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: pageView,
            data: {
              page: 'Redeem Gift',
            },
          },
        },
      };
    }

    it('Promo Tab - Desktop', () => {
      device.setMobileWidth(false);
      const expected = getExpected('Page View');
      expectInputEventMatchesMixpanelData(
        createAccountEvent('open_promo_entry'),
        expected,
      );
    });

    it('Promo Tab - Mobile', () => {
      device.setMobileWidth(true);
      const expected = getExpected('Screen View');
      expectInputEventMatchesMixpanelData(
        createAccountEvent('open_promo_entry'),
        expected,
      );
    });

    it('Redeem Gift', () => {
      const expected: MixpanelData = {
        entity: 'account',
        action: 'submit_promo',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: 'Redeem Gift',
            data: {},
          },
        },
      };
      expectInputEventMatchesMixpanelData(
        createAccountEvent('submit_promo'),
        expected,
      );
    });
  });

  describe('UploadButtonComponent', () => {
    function getExpected(
      workspace: 'Private Files' | 'Public Files',
    ): MixpanelData {
      return {
        entity: 'account',
        action: 'initiate_upload',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: 'Initiate Upload',
            data: {
              workspace,
            },
          },
        },
      };
    }

    it('Private Workspace', () => {
      data.setCurrentFolderType('type.folder.private');
      const expected = getExpected('Private Files');
      expectInputEventMatchesMixpanelData(
        createAccountEvent('initiate_upload'),
        expected,
      );
    });

    it('Public Workspace', () => {
      data.setCurrentFolderType('type.folder.public');
      const expected = getExpected('Public Files');
      expectInputEventMatchesMixpanelData(
        createAccountEvent('initiate_upload'),
        expected,
      );
    });
  });

  describe('EditService (non-analytics events)', () => {
    it('record move', () => {
      expectNoAnalyticsCall({
        entity: 'record',
        action: 'move',
        record: new RecordVO({ recordId: 1 }),
      });
    });

    it('record copy', () => {
      expectNoAnalyticsCall({
        entity: 'record',
        action: 'copy',
        record: new RecordVO({ recordId: 1 }),
      });
    });
  });

  describe('Uploader events', () => {
    function getExpected(
      workspace: 'Private Files' | 'Public Files',
    ): MixpanelData {
      return {
        action: 'submit',
        entity: 'record',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: 'Finalize Upload',
            data: {
              workspace,
            },
          },
        },
      };
    }

    const input: PermanentEvent = {
      entity: 'record',
      action: 'submit',
      record: new RecordVO({ recordId: 1 }),
    };

    it('Private Upload', () => {
      data.setCurrentFolderType('type.folder.private');
      const expected = getExpected('Private Files');
      expectInputEventMatchesMixpanelData(input, expected);
    });

    it('Public Upload', () => {
      data.setCurrentFolderType('type.folder.public');
      const expected = getExpected('Public Files');
      expectInputEventMatchesMixpanelData(input, expected);
    });
  });

  it('DirectiveDialogComponent', () => {
    const expected: MixpanelData = {
      entity: 'account',
      action: 'open_archive_steward',
      version: 1,
      entityId: '1',
      body: {
        analytics: {
          event: 'View Archive Steward',
          data: {
            page: 'Archive Steward',
          },
        },
      },
    };
    expectInputEventMatchesMixpanelData(
      createAccountEvent('open_archive_steward'),
      expected,
    );
  });

  describe('DirectiveEditComponent', () => {
    function createDirectiveEvent(action: DirectiveAction): DirectiveEvent {
      return {
        entity: 'directive',
        action,
        directive: new Directive({ directiveId: 'test' }),
      };
    }
    it('update', () => {
      const expected: MixpanelData = {
        entity: 'directive',
        action: 'update',
        version: 1,
        entityId: 'test',
        body: {
          analytics: {
            event: 'Edit Archive Steward',
            data: {},
          },
        },
      };
      expectInputEventMatchesMixpanelData(
        createDirectiveEvent('update'),
        expected,
      );
    });

    it('create', () => {
      const expected: MixpanelData = {
        entity: 'directive',
        action: 'create',
        version: 1,
        entityId: 'test',
        body: {
          analytics: {
            event: 'Edit Archive Steward',
            data: {},
          },
        },
      };
      expectInputEventMatchesMixpanelData(
        createDirectiveEvent('create'),
        expected,
      );
    });
  });

  it('LegacyContactDialog', () => {
    const expected: MixpanelData = {
      entity: 'account',
      action: 'open_legacy_contact',
      version: 1,
      entityId: '1',
      body: {
        analytics: {
          event: 'View Legacy Contact',
          data: {
            page: 'Legacy Contact',
          },
        },
      },
    };
    expectInputEventMatchesMixpanelData(
      createAccountEvent('open_legacy_contact'),
      expected,
    );
  });

  describe('LegacyContactEditComponent', () => {
    function createLegacyContactEvent(
      action: LegacyContactAction,
    ): LegacyContactEvent {
      return {
        entity: 'legacy_contact',
        action,
        legacyContact: {
          legacyContactId: 'test-legacy-contact',
          name: 'Unit Test',
          email: 'test@example.com',
        },
      };
    }
    function getExpected(action: 'create' | 'update'): MixpanelData {
      return {
        entity: 'legacy_contact',
        action,
        version: 1,
        entityId: 'test-legacy-contact',
        body: {
          analytics: {
            event: 'Edit Legacy Contact',
            data: {},
          },
        },
      };
    }

    it('legacy_contact create', () => {
      const expected = getExpected('create');
      expectInputEventMatchesMixpanelData(
        createLegacyContactEvent('create'),
        expected,
      );
    });

    it('legacy_contact update', () => {
      const expected = getExpected('update');
      expectInputEventMatchesMixpanelData(
        createLegacyContactEvent('update'),
        expected,
      );
    });
  });

  it('PublishComponent', () => {
    expectNoAnalyticsCall({
      entity: 'record',
      action: 'publish',
      record: new RecordVO({ recordId: 1 }),
    });
  });

  describe('CreateNewArchiveComponent', () => {
    it('Start Onboarding', () => {
      const expected: MixpanelData = {
        entity: 'account',
        action: 'start_onboarding',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: 'Onboarding: start',
            data: {},
          },
        },
      };
      expectInputEventMatchesMixpanelData(
        createAccountEvent('start_onboarding'),
        expected,
      );
    });

    describe('Screens', () => {
      function getExpected(
        screen: 'create' | 'goals' | 'reasons',
      ): MixpanelData {
        return {
          entity: 'account',
          action:
            screen === 'create'
              ? screen
              : (('submit_' + screen) as PermanentEvent['action']),
          version: 1,
          entityId: '1',
          body: {
            analytics: {
              event: 'Onboarding: ' + screen,
              data: {},
            },
          },
        };
      }

      it('screen: goals', () => {
        expectInputEventMatchesMixpanelData(
          createAccountEvent('submit_goals'),
          getExpected('goals'),
        );
      });

      it('screen: reasons', () => {
        expectInputEventMatchesMixpanelData(
          createAccountEvent('submit_reasons'),
          getExpected('reasons'),
        );
      });
    });

    it('Skip Onboarding', () => {
      const expected: MixpanelData = {
        entity: 'account',
        action: 'skip_create_archive',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: 'Skip Create Archive',
            data: {},
          },
        },
      };
      expectInputEventMatchesMixpanelData(
        createAccountEvent('skip_create_archive'),
        expected,
      );
    });

    describe('Skip steps', () => {
      function getExpected(
        screen: 'goals' | 'reasons' | 'create',
      ): MixpanelData {
        const mixpanelActions: { [key: string]: PermanentEvent['action'] } = {
          goals: 'skip_goals',
          reasons: 'skip_why_permanent',
        };
        const event = screen === 'goals' ? 'Skip goals' : 'Skip why permanent';
        return {
          entity: 'account',
          action: mixpanelActions[screen],
          version: 1,
          entityId: '1',
          body: {
            analytics: {
              event,
              data: {},
            },
          },
        };
      }

      it('skip goals', () => {
        const expected = getExpected('goals');
        expectInputEventMatchesMixpanelData(
          createAccountEvent('skip_goals'),
          expected,
        );
      });

      it('skip reasons', () => {
        const expected = getExpected('reasons');
        expectInputEventMatchesMixpanelData(
          createAccountEvent('skip_why_permanent'),
          expected,
        );
      });
    });
  });

  it('OnboardingComponent', () => {
    const expected: MixpanelData = {
      entity: 'account',
      action: 'create',
      entityId: '1',
      version: 1,
      body: {
        analytics: {
          event: 'Sign up',
          data: {},
        },
      },
    };
    expectInputEventMatchesMixpanelData(createAccountEvent('create'), expected);
  });

  describe('NewPledgeComponent', () => {
    describe('Open', () => {
      function getExpected(
        pageView: 'Page View' | 'Screen View',
      ): MixpanelData {
        return {
          action: 'open_storage_modal',
          entity: 'account',
          version: 1,
          entityId: '1',
          body: {
            analytics: {
              event: pageView,
              data: { page: 'Storage' },
            },
          },
        };
      }

      it('Open storage - desktop', () => {
        device.setMobileWidth(false);
        expectInputEventMatchesMixpanelData(
          createAccountEvent('open_storage_modal'),
          getExpected('Page View'),
        );
      });

      it('Open storage - mobile', () => {
        device.setMobileWidth(true);
        expectInputEventMatchesMixpanelData(
          createAccountEvent('open_storage_modal'),
          getExpected('Screen View'),
        );
      });
    });

    it('Purchase Storage', () => {
      const expected: MixpanelData = {
        entity: 'account',
        action: 'purchase_storage',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: 'Purchase Storage',
            data: {},
          },
        },
      };
      expectInputEventMatchesMixpanelData(
        createAccountEvent('purchase_storage'),
        expected,
      );
    });
  });

  describe('AccountDropdown', () => {
    function getExpected(pageView: 'Page View' | 'Screen View'): MixpanelData {
      return {
        action: 'open_account_menu',
        entity: 'account',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: pageView,
            data: { page: 'Account Menu' },
          },
        },
      };
    }

    it('Open Account Menu - Desktop', () => {
      device.setMobileWidth(false);
      expectInputEventMatchesMixpanelData(
        createAccountEvent('open_account_menu'),
        getExpected('Page View'),
      );
    });

    it('Open Account Menu - Mobile', () => {
      device.setMobileWidth(true);
      expectInputEventMatchesMixpanelData(
        createAccountEvent('open_account_menu'),
        getExpected('Screen View'),
      );
    });
  });

  it('AccountService', () => {
    const expected: MixpanelData = {
      entity: 'account',
      action: 'login',
      version: 1,
      entityId: '1',
      body: {
        analytics: {
          event: 'Sign in',
          data: {},
        },
      },
    };
    expectInputEventMatchesMixpanelData(createAccountEvent('login'), expected);
  });

  it('Sets distinct ID correctly', () => {
    account.setAccount(new AccountVO({ accountId: 12345 }));

    event.dispatch(createAccountEvent('login'));

    const req = http.expectOne(`${environment.apiUrl}/v2/event`);

    expect(req.request.body.body.analytics.distinctId).toBe('12345');

    req.flush({});
  });

  it('sets distinct ID for dev environments correctly', () => {
    const debug = environment.analyticsDebug;
    const env = environment.environment;
    environment.analyticsDebug = true;
    environment.environment = 'unittest';
    account.setAccount(new AccountVO({ accountId: 12345 }));

    event.dispatch(createAccountEvent('login'));

    const req = http.expectOne(`${environment.apiUrl}/v2/event`);

    expect(req.request.body.body.analytics.distinctId).toBe('unittest:12345');

    req.flush({});

    environment.analyticsDebug = debug;
    environment.environment = env;
  });

  it('gets accountId from AccountService if not supplied', () => {
    account.setAccount(new AccountVO({ accountId: 12345 }));

    event.dispatch({ entity: 'account', action: 'login' });

    const req = http.expectOne(`${environment.apiUrl}/v2/event`);

    expect(req.request.body.entityId).toBe('12345');

    req.flush({});
  });
});
