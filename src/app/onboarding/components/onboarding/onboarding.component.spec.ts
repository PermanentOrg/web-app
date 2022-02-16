import { Shallow } from 'shallow-render';
import { Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OnboardingComponent } from './onboarding.component';
import { OnboardingModule } from '../../onboarding.module';

import { ArchiveVO } from '@models/archive-vo';
import { AccountVO } from '@models/account-vo';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

class NullRoute {
  public snapshot = {
    data: {}
  };
}

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
        }
      }
    },
    accept: async (data: any) => {
      return true;
    }
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
  setArchive: (archive: ArchiveVO) => {}
};
const mockMessageService = {
  showMessage: () => {},
  showError: () => {},
};

const mockRouter = {
  async navigate(path: any[]) {
    return {};
  }
}

describe('OnboardingComponent #onboarding', () => {
  let shallow: Shallow<OnboardingComponent>;
  beforeEach(() => {
    shallow = new Shallow(OnboardingComponent, OnboardingModule)
      .mock(ActivatedRoute, new NullRoute())
      .mock(Location, { go: (path: string) => {}})
      .mock(ApiService, mockApiService)
      .mock(AccountService, mockAccountService)
      .mock(Router, mockRouter)
      .mock(MessageService, mockMessageService)
      .replaceModule(RouterModule, RouterTestingModule);
  });
  it('should exist', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });
  it('should load the welcome screen as default', async () => {
    const { find, fixture } = await shallow.render();
    fixture.detectChanges();
    expect(find('pr-welcome-screen')).toHaveFoundOne();
  });
  it('can change screens', async () => {
    const { find, fixture } = await shallow.render();
    expect(find('pr-welcome-screen')).toHaveFoundOne();
    find('pr-welcome-screen').triggerEventHandler('nextScreen', OnboardingScreen.newArchive);
    fixture.detectChanges();
    expect(find('pr-welcome-screen')).toHaveFound(0);
  });
  it('stores the newly created archive', async () => {
    const { element, find, fixture } = await shallow.render();
    expect(element.componentInstance.currentArchive).toBeUndefined();
    fixture.detectChanges();
    expect(find('pr-welcome-screen')).toHaveFoundOne();
    find('pr-welcome-screen').triggerEventHandler('nextScreen', OnboardingScreen.newArchive);
    fixture.detectChanges();
    find('pr-create-new-archive').triggerEventHandler('createdArchive', new ArchiveVO({}));
    expect(element.componentInstance.currentArchive).not.toBeUndefined();
  });
  it('stores an accepted archive invitation', async () => {
    const { element, find, fixture } = await shallow.render();
    expect(element.componentInstance.currentArchive).toBeUndefined();
    expect(find('pr-welcome-screen')).toHaveFoundOne();
    find('pr-welcome-screen').triggerEventHandler('acceptInvitation', new ArchiveVO({fullName: 'Pending Test'}));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(element.componentInstance.currentArchive).not.toBeUndefined();
  });
  it('can be tested with debugging component', async () => {
    const { element } = await shallow.render();
    expect(element.componentInstance.pendingArchives.length).toBe(0);
    element.componentInstance.setState({
      pendingArchives: [new ArchiveVO({})]
    });
    expect(element.componentInstance.pendingArchives.length).toBe(1);
  });
});
