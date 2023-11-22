/* @format */
import { waitForAsync } from '@angular/core/testing';
import { PublicModule } from '@public/public.module';
import { Shallow } from 'shallow-render';
import { of } from 'rxjs';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { PublicArchiveComponent } from './public-archive.component';

const publicProfileServiceMock = {
  publicRoot$: () => of({}),
  archive$: () => of({}),
  profileItemsDictionary$: () => of({}),
};

describe('PublicArchiveComponent', () => {
  let shallow: Shallow<PublicArchiveComponent>;

  beforeEach(waitForAsync(() => {
    shallow = new Shallow(PublicArchiveComponent, PublicModule).provideMock({
      provide: PublicProfileService,
      useValue: publicProfileServiceMock,
    });
  }));

  it('should create', async () => {
    const { instance } = await shallow.render();
    expect(instance).toBeTruthy();
  });

  it('should have the information hidden as default', async () => {
    const { instance } = await shallow.render();
    expect(instance.showProfileInformation).toBe(false);
  });

  it('should have the information shown when the button is clicked', async () => {
    const { instance, find } = await shallow.render();
    const icon = find('.icon-expand');
    icon.nativeElement.click();
    expect(instance.showProfileInformation).toBe(true);
  });

  it('should give the correct classes when expanding the information', async () => {
    const { find, fixture, instance } = await shallow.render();
    const icon = find('.icon-expand');
    icon.nativeElement.click();

    fixture.detectChanges();

    expect(find('.profile-description').classes).toEqual({
      'profile-description': true,
      'profile-description-show': true,
    });

    instance.isViewingProfile$ = of(true);

    fixture.detectChanges();

    expect(find('.profile-info').classes).toEqual({
      'profile-info': true,
      'profile-info-show': true,
    });
  });
});
