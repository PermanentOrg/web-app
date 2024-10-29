/* @format */
import { Shallow } from 'shallow-render';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from '@shared/services/api/api.service';
import { InviteVO, InviteVOData } from '@models/invite-vo';
import { InviteResponse } from '@shared/services/api/invite.repo';
import { OnboardingModule } from '../../onboarding.module';
import { ArchiveCreationWithShareComponent } from './archive-creation-with-share.component';

class MockInviteApiResponse extends InviteResponse {
  public inviteVo: InviteVO | undefined;

  constructor(invite: InviteVOData) {
    super({});
    this.inviteVo = new InviteVO(invite);
  }

  public getInviteVO(): InviteVO {
    return this.inviteVo;
  }
}

class MockInviteRepo {
  public inviteVo: InviteVOData = {};
  protected token: string = null;

  public resetToken(): void {
    this.token = null;
  }

  public getToken(): string {
    return this.token;
  }

  public async getFullShareInvite(token: string): Promise<InviteResponse> {
    this.token = token;
    return new MockInviteApiResponse(this.inviteVo);
  }
}

describe('ArchiveCreationWithShareToken', () => {
  let shallow: Shallow<ArchiveCreationWithShareComponent>;
  let mockInvite: MockInviteRepo;

  function setLocalStorage(token: string) {
    spyOn(localStorage, 'getItem').and.returnValue(token);
  }

  beforeEach(() => {
    mockInvite = new MockInviteRepo();

    shallow = new Shallow(ArchiveCreationWithShareComponent, OnboardingModule)
      .provideMock({
        provide: ApiService,
        useValue: { invite: mockInvite },
      })
      .import(HttpClientTestingModule);
  });

  it('should create', async () => {
    setLocalStorage(null);
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should fetch invite data and set sharer and shared item names when shareToken is present', async () => {
    mockInvite.inviteVo = {
      AccountVO: { fullName: 'Sharer Name' },
      RecordVO: { displayName: 'Shared Item Name' },
    };
    setLocalStorage('shareToken');

    const { instance, fixture } = await shallow.render();

    instance.ngOnInit();
    await fixture.whenStable();

    expect(mockInvite.getToken()).toBe('shareToken');
    expect(instance.sharerName).toBe('Sharer Name');
    expect(instance.sharedItemName).toBe('Shared Item Name');
  });

  it('should not fetch invite data if no shareToken is present', async () => {
    setLocalStorage(null);
    const { instance, fixture } = await shallow.render();

    instance.ngOnInit();
    await fixture.whenStable();

    expect(mockInvite.getToken()).toBeNull();
    expect(instance.sharerName).toBeUndefined();
    expect(instance.sharedItemName).toBeUndefined();
  });

  it('should display the record icon if the shared item is a record', async () => {
    mockInvite.inviteVo = {
      AccountVO: { fullName: 'Sharer Name' },
      RecordVO: { displayName: 'Shared Item Name' },
    };
    setLocalStorage('shareToken');

    const { instance, fixture } = await shallow.render();

    instance.ngOnInit();
    await fixture.whenStable();

    expect(instance.isFolder).toBe(false);
  });

  it('should display the folder icon if the shared item is a folder', async () => {
    mockInvite.inviteVo = {
      AccountVO: { fullName: 'Sharer Name' },
      FolderVO: { displayName: 'potato' },
    };
    setLocalStorage('shareToken');

    const { instance, fixture } = await shallow.render();

    instance.ngOnInit();
    await fixture.whenStable();

    expect(instance.isFolder).toBe(true);
  });
});
