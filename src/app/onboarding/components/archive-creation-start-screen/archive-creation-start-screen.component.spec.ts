/* @format */
import { Shallow } from 'shallow-render';
import { OnboardingModule } from '../../onboarding.module';
import { ArchiveCreationStartScreenComponent } from './archive-creation-start-screen.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';

const mockAccountService = {
  getAccount: () => ({ fullName: 'John Doe' }),
};

describe('ArchiveCreationStartScreenComponent', () => {
  let shallow: Shallow<ArchiveCreationStartScreenComponent>;

  beforeEach(() => {
    shallow = new Shallow(ArchiveCreationStartScreenComponent, OnboardingModule)
      .mock(AccountService, mockAccountService)
      .import(HttpClientTestingModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });
});
