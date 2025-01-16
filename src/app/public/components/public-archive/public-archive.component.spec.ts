/* @format */
import { waitForAsync } from '@angular/core/testing';
import { PublicModule } from '@public/public.module';
import { Shallow } from 'shallow-render';
import { of } from 'rxjs';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { Router } from '@angular/router';
import { PublicArchiveComponent } from './public-archive.component';
import { ArchiveVO } from '@models/index';

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

    expect(find('.archive-description').classes).toEqual({
      'archive-description': true,
      'archive-description-show': true,
    });
  });

  it('should navigate to the correct search URL on handleSearch', async () => {
    const { instance, inject } = await shallow.render();
    const router = inject(Router);
    spyOn(router, 'navigate');

    instance.archive = { archiveId: '123' } as any;

    instance.onHandleSearch('test-query');

    expect(router.navigate).toHaveBeenCalledWith(
      ['search', '123', 'test-query'],
      { relativeTo: instance.route },
    );
  });

  it('should navigate to the correct search-tag URL on tag click', async () => {
    const { instance, inject } = await shallow.render();
    const router = inject(Router);
    spyOn(router, 'navigate');

    instance.archive = new ArchiveVO({ archiveId: '123' });

    instance.onTagClick({ tagId: 'example-tag-id', tagName: 'tag-name' });

    expect(router.navigate).toHaveBeenCalledWith(
      ['search-tag', '123', 'example-tag-id', 'tag-name'],
      { relativeTo: instance.route },
    );
  });
});
