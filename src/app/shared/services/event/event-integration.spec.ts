import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';
import { HttpV2Service } from '../http-v2/http-v2.service';
import {
  AnalyticsService,
  MixpanelAction,
} from '../analytics/analytics.service';
import { StorageService } from '../storage/storage.service';
import { EventService } from './event.service';
import { EventData } from './event-types';

describe('EventService Characterization Tests', () => {
  let event: EventService;
  let analytics: AnalyticsService;
  let http: HttpTestingController;

  function expectInputEventMatchesMixpanelData(
    inputEvent: EventData,
    expected: EventData,
  ) {
    event.notifyObservers(inputEvent);

    const req = http.expectOne(`${environment.apiUrl}/v2/event`);

    expect(req.request.body).toEqual(expected);

    req.flush({});
  }

  function expectNoAnalyticsCall(input: EventData) {
    event.notifyObservers(input);

    http.expectNone(`${environment.apiUrl}/v2/event`);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpV2Service,
        EventService,
        AnalyticsService,
        StorageService,
      ],
    });
    event = TestBed.inject(EventService);
    analytics = TestBed.inject(AnalyticsService);
    http = TestBed.inject(HttpTestingController);
    event.addObserver(TestBed.inject(AnalyticsService));
    localStorage.setItem('account', JSON.stringify({ accountId: '1' }));
    environment.analyticsDebug = false;
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('account');
  });

  it('exists', () => {
    expect(event).not.toBeUndefined();
  });

  it('VerifyComponent', () => {
    const expected: EventData = {
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
    expectInputEventMatchesMixpanelData(expected, expected);
  });

  it('AccountSettingsComponent', () => {
    const expected: EventData = {
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
    expectInputEventMatchesMixpanelData(expected, expected);
  });

  it('BillingSettingsComponent', () => {
    const expected: EventData = {
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
    expectInputEventMatchesMixpanelData(expected, expected);
  });

  describe('OpenArchiveMenu', () => {
    /*
    Includes calls from:
    - LeftMenuComponent
    - NavComponent
    */

    function getExpected(event: 'Page View' | 'Screen View'): EventData {
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
      const expected = getExpected('Page View');
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('Mobile', () => {
      const expected = getExpected('Screen View');
      expectInputEventMatchesMixpanelData(expected, expected);
    });
  });

  describe('ProfileEditComponent', () => {
    function getExpected(pageView: 'Page View' | 'Screen View'): EventData {
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
      const expected = getExpected('Page View');
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('Load - Mobile', () => {
      const expected = getExpected('Screen View');
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('Update ProfileItem', () => {
      const expected: EventData = {
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
      expectInputEventMatchesMixpanelData(expected, expected);
    });
  });

  describe('StorageDialogComponent', () => {
    function getExpected(pageView: 'Page View' | 'Screen View'): EventData {
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
      const expected = getExpected('Page View');
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('Promo Tab - Mobile', () => {
      const expected = getExpected('Screen View');
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('Redeem Gift', () => {
      const expected: EventData = {
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
      expectInputEventMatchesMixpanelData(expected, expected);
    });
  });

  describe('UploadButtonComponent', () => {
    function getExpected(
      workspace: 'Private Files' | 'Public Files',
    ): EventData {
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
      const expected = getExpected('Private Files');
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('Public Workspace', () => {
      const expected = getExpected('Public Files');
      expectInputEventMatchesMixpanelData(expected, expected);
    });
  });

  describe('EditService (non-analytics events)', () => {
    it('record move', () => {
      const input: EventData = {
        entity: 'record',
        action: 'move',
        entityId: '1',
        version: 1,
        body: {
          noTransmit: true,
        },
      };

      expectNoAnalyticsCall(input);
    });

    it('record copy', () => {
      const input: EventData = {
        entity: 'record',
        action: 'copy',
        entityId: '1',
        version: 1,
        body: {
          noTransmit: true,
        },
      };
      expectNoAnalyticsCall(input);
    });
  });

  describe('Uploader events', () => {
    function getExpected(
      workspace: 'Private Files' | 'Public Files',
    ): EventData {
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
    it('Private Upload', () => {
      const expected = getExpected('Private Files');
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('Public Upload', () => {
      const expected = getExpected('Public Files');
      expectInputEventMatchesMixpanelData(expected, expected);
    });
  });

  it('DirectiveDialogComponent', () => {
    const expected: EventData = {
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
    expectInputEventMatchesMixpanelData(expected, expected);
  });

  describe('DirectiveEditComponent', () => {
    it('update', () => {
      const expected: EventData = {
        entity: 'directive',
        action: 'update',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: 'Edit Archive Steward',
            data: {},
          },
        },
      };
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('create', () => {
      const expected: EventData = {
        entity: 'directive',
        action: 'create',
        version: 1,
        entityId: '1',
        body: {
          analytics: {
            event: 'Edit Archive Steward',
            data: {},
          },
        },
      };
      expectInputEventMatchesMixpanelData(expected, expected);
    });
  });

  it('LegacyContactDialog', () => {
    const expected: EventData = {
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
    expectInputEventMatchesMixpanelData(expected, expected);
  });

  describe('LegacyContactEditComponent', () => {
    function getExpected(action: 'create' | 'update'): EventData {
      return {
        entity: 'legacy_contact',
        action,
        version: 1,
        entityId: '1',
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
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('legacy_contact update', () => {
      const expected = getExpected('update');
      expectInputEventMatchesMixpanelData(expected, expected);
    });
  });

  it('PublishComponent', () => {
    const input: EventData = {
      entity: 'record',
      action: 'publish',
      version: 1,
      entityId: '1',
      body: {
        noTransmit: true,
      },
    };
    expectNoAnalyticsCall(input);
  });

  describe('CreateNewArchiveComponent', () => {
    it('Start Onboarding', () => {
      const expected: EventData = {
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
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    describe('Screens', () => {
      // Guys... I need eyes
      function getExpected(screen: 'create' | 'goals' | 'reason'): EventData {
        return {
          entity: 'account',
          action: ('submit_' + screen) as MixpanelAction,
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
      it('screen: start', () => {
        const expected = getExpected('create');
        expectInputEventMatchesMixpanelData(expected, expected);
      });

      it('screen: goals', () => {
        const expected = getExpected('goals');
        expectInputEventMatchesMixpanelData(expected, expected);
      });

      it('screen: reason', () => {
        const expected = getExpected('reason');
        expectInputEventMatchesMixpanelData(expected, expected);
      });
    });

    it('Skip Onboarding', () => {
      const expected: EventData = {
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
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    describe('Skip steps', () => {
      function getExpected(screen: 'goals' | 'reasons' | 'create'): EventData {
        const mixpanelActions: { [key: string]: MixpanelAction } = {
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
        expectInputEventMatchesMixpanelData(expected, expected);
      });

      it('skip reasons', () => {
        const expected = getExpected('reasons');
        expectInputEventMatchesMixpanelData(expected, expected);
      });
    });
  });

  it('OnboardingComponent', () => {
    const expected: EventData = {
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
    expectInputEventMatchesMixpanelData(expected, expected);
  });

  describe('NewPledgeComponent', () => {
    describe('Open', () => {
      function getExpected(
        pageView: 'Public Files' | 'Private Files',
      ): EventData {
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

      it('open in public files', () => {
        const expected = getExpected('Public Files');
        expectInputEventMatchesMixpanelData(expected, expected);
      });

      it('open in private files', () => {
        const expected = getExpected('Private Files');
        expectInputEventMatchesMixpanelData(expected, expected);
      });
    });

    it('Purchase Storage', () => {
      const expected: EventData = {
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
      expectInputEventMatchesMixpanelData(expected, expected);
    });
  });

  describe('AccountDropdown', () => {
    function getExpected(
      pageView: 'Public Files' | 'Private Files',
    ): EventData {
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

    it('Open Account Menu Public', () => {
      const expected = getExpected('Public Files');
      expectInputEventMatchesMixpanelData(expected, expected);
    });

    it('Open Account Menu Private', () => {
      const expected = getExpected('Private Files');
      expectInputEventMatchesMixpanelData(expected, expected);
    });
  });

  it('AccountService', () => {
    const expected: EventData = {
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
    expectInputEventMatchesMixpanelData(expected, expected);
  });
});
