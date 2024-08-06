/* @format */
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@root/app/models';
import { CoreModule } from '@core/core.module';
import { MessageService } from '@shared/services/message/message.service';
import { Shallow } from 'shallow-render';
import { ApiService } from '../../../shared/services/api/api.service';
import { AdvancedSettingsComponent } from './advanced-settings.component';

const mockAccountService = {
  getAccount: () => {
    return new AccountVO({ accountId: 1, allowSftpDeletion: true });
  },
  setAccount: (account: AccountVO) => {},
};

const mockApiService = {
  account: {
    update: (account: AccountVO) => {
      return Promise.resolve(account);
    },
  },
};

describe('AdvancedSettingsComponent', () => {
  let shallow: Shallow<AdvancedSettingsComponent>;
  let messageShown = false;

  beforeEach(async () => {
    shallow = new Shallow(AdvancedSettingsComponent, CoreModule)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      })
      .mock(ApiService, mockApiService)
      .mock(AccountService, mockAccountService);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).not.toBeNull();
  });

  it('initializes allowSFTPDeletion from the account service', async () => {
    const { instance } = await shallow.render();

    expect(instance.allowSFTPDeletion).toEqual(1);
  });

  it('updates account on calling onAllowSFTPDeletion', async () => {
    const { instance, inject } = await shallow.render();
    const apiService = inject(ApiService);
    const spy = spyOn(apiService.account, 'update').and.resolveTo(
      new AccountVO({}),
    );

    await instance.onAllowSFTPDeletion();

    expect(spy).toHaveBeenCalled();
  });

  it('handles errors in onAllowSFTPDeletion', async () => {
    const { instance, inject } = await shallow.render();

    spyOn(inject(ApiService).account, 'update').and.throwError('test error');

    await instance.onAllowSFTPDeletion();

    expect(messageShown).toBe(true);
  });
});
