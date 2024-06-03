/* @format */
import { Shallow } from 'shallow-render';
import { Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ArchiveVO } from '@models/archive-vo';
import { AccountVO } from '@models/account-vo';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  EventData,
  AnalyticsService,
  AnalyticsObserver,
} from '@shared/services/analytics/analytics.service';
import { OnboardingModule } from '../../onboarding.module';
import { OnboardingComponent } from './onboarding.component';

class NullRoute {
  public snapshot = {
    data: {},
  };
}

const mockAnalyticsService = {
  notifyObservers: (data: EventData) => {},
  addObserver: (observer: AnalyticsObserver) => {},
};

let throwError: boolean = false;
const mockApiService = {
  archive: {
    getAllArchives: async (data: any) => {
      if (throwError) {
        throw 'Test Error';
      }
      return {
        getArchiveVos: () => {
          return [];
        },
      };
    },
    accept: async (data: any) => {
      return true;
    },
    change: async (archive: ArchiveVO) => {},
  },
};
const mockAccountService = {
  getAccount: () => {
    return new AccountVO({
      accountId: 1,
      fullName: 'Test Account',
    });
  },
  refreshArchives: async () => {
    return [];
  },
  setArchive: (archive: ArchiveVO) => {},
  updateAccount: async () => {},
  change: async () => {},
};
const mockMessageService = {
  showMessage: () => {},
  showError: () => {},
};

const mockRouter = {
  async navigate(path: any[]) {
    return {};
  },
};

describe('OnboardingComponent #onboarding', () => {
  let shallow: Shallow<OnboardingComponent>;
  beforeEach(() => {
    shallow = new Shallow(OnboardingComponent, OnboardingModule)
      .mock(ActivatedRoute, new NullRoute())
      .mock(Location, { go: (path: string) => {} })
      .mock(ApiService, mockApiService)
      .mock(AccountService, mockAccountService)
      .mock(Router, mockRouter)
      .mock(MessageService, mockMessageService)
      .mock(AnalyticsService, mockAnalyticsService)
      .replaceModule(RouterModule, RouterTestingModule);
  });

  it('should exist', async () => {
    const { element } = await shallow.render();

    expect(element).not.toBeNull();
  });

  it('should load the create new archive screen as default', async () => {
    const { find, fixture } = await shallow.render();
    fixture.detectChanges();

    expect(find('pr-create-new-archive')).toHaveFoundOne();
  });

  it('can change screens', async () => {
    const { find, fixture } = await shallow.render();

    expect(find('pr-create-new-archive')).toHaveFoundOne();
    fixture.detectChanges();

    expect(find('pr-welcome-screen')).toHaveFound(0);
  });

  it('stores the newly created archive', async () => {
    const { element, find, fixture } = await shallow.render();

    expect(element.componentInstance.currentArchive).toBeUndefined();
    fixture.detectChanges();

    const child = find('pr-create-new-archive');

    expect(child).toHaveFoundOne();
    child.triggerEventHandler('createdArchive', new ArchiveVO({}));

    expect(element.componentInstance.currentArchive).not.toBeUndefined();
  });

  it('stores an accepted archive invitation', async () => {
    const mockPendingArchive = new ArchiveVO({ status: 'someStatus-pending' });

    const mockAccountService = {
      refreshArchives: jasmine
        .createSpy('refreshArchives')
        .and.returnValue(Promise.resolve([mockPendingArchive])),
      getAccount: jasmine
        .createSpy('getAccount')
        .and.returnValue(
          new AccountVO({ accountId: 1, fullName: 'Test Account' }),
        ),
    };

    const shallow = new Shallow(OnboardingComponent, OnboardingModule)
      .mock(AccountService, mockAccountService)
      .mock(ApiService, mockApiService)
      .import(HttpClientTestingModule);

    const { instance, find, fixture, element } = await shallow.render();

    await instance.ngOnInit();

    if (instance.pendingArchives.length > 0) {
      expect(instance.screen).toBe(OnboardingScreen.pendingArchives);
    }

    expect(find('pr-welcome-screen')).toHaveFoundOne();
    find('pr-welcome-screen').triggerEventHandler(
      'selectInvitation',
      new ArchiveVO({ fullName: 'Pending Test' }),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(
      element.componentInstance.selectedPendingArchive,
    ).not.toBeUndefined();
  });

  it('can be tested with debugging component', async () => {
    const { element } = await shallow.render();

    expect(element.componentInstance.pendingArchives.length).toBe(0);
    element.componentInstance.setState({
      pendingArchives: [new ArchiveVO({})],
    });

    expect(element.componentInstance.pendingArchives.length).toBe(1);
  });

  it('displays the pending archives screen when there are pending archives', async () => {
    const mockPendingArchive = new ArchiveVO({ status: 'someStatus-pending' });

    const mockAccountService = {
      refreshArchives: jasmine
        .createSpy('refreshArchives')
        .and.returnValue(Promise.resolve([mockPendingArchive])),
      getAccount: jasmine
        .createSpy('getAccount')
        .and.returnValue(
          new AccountVO({ accountId: 1, fullName: 'Test Account' }),
        ),
    };

    const shallow = new Shallow(OnboardingComponent, OnboardingModule)
      .mock(AccountService, mockAccountService)
      .mock(ApiService, mockApiService)
      .import(HttpClientTestingModule);

    const { instance } = await shallow.render();

    await instance.ngOnInit();

    if (instance.pendingArchives.length > 0) {
      expect(instance.screen).toBe(OnboardingScreen.pendingArchives);
    }
  });
});
