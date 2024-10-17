/* @format */
import { Shallow } from 'shallow-render';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from '@shared/services/api/api.service';
import { OnboardingModule } from '../../onboarding.module';
import { ArchiveCreationWithShareComponent } from './archive-creation-with-share.component';

describe('ArchiveCreationWithShareToken', () => {
  let shallow: Shallow<ArchiveCreationWithShareComponent>;

  beforeEach(() => {
    shallow = new Shallow(
      ArchiveCreationWithShareComponent,
      OnboardingModule,
    ).import(HttpClientTestingModule);
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should fetch invite data and set sharer and shared item names when shareToken is present', async () => {
    const mockApi = {
      invite: {
        getFullShareInvite: jasmine.createSpy().and.returnValue(
          Promise.resolve({
            getInviteVO: () => ({
              AccountVO: { fullName: 'Sharer Name' },
              ArchiveVO: { fullName: 'Shared Item Name' },
            }),
          }),
        ),
      },
    };

    const { instance, fixture } = await shallow
      .mock(ApiService, mockApi)
      .render();

    spyOn(localStorage, 'getItem').and.returnValue('shareToken');

    instance.ngOnInit();
    await fixture.whenStable();

    expect(mockApi.invite.getFullShareInvite).toHaveBeenCalledWith(
      'shareToken',
    );

    expect(instance.sharerName).toBe('Sharer Name');
    expect(instance.sharedItemName).toBe('Shared Item Name');
  });

  it('should not fetch invite data if no shareToken is present', async () => {
    const mockApi = {
      invite: {
        getFullShareInvite: jasmine.createSpy(),
      },
    };

    const { instance, fixture } = await shallow
      .mock(ApiService, mockApi)
      .render();

    spyOn(localStorage, 'getItem').and.returnValue(null);

    instance.ngOnInit();
    await fixture.whenStable();

    expect(mockApi.invite.getFullShareInvite).not.toHaveBeenCalled();
    expect(instance.sharerName).toBeUndefined();
    expect(instance.sharedItemName).toBeUndefined();
  });

  it('should not set sharerName or sharedItemName if no token is present', async () => {
    const { instance } = await shallow.render();
    spyOn(localStorage, 'getItem').and.returnValue(null); // No token

    instance.ngOnInit();

    expect(instance.sharerName).toBeUndefined();
    expect(instance.sharedItemName).toBeUndefined();
  });
});
