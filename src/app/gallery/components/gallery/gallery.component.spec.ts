/* @format */
import { Shallow } from 'shallow-render';
import { GalleryComponent } from './gallery.component';
import { FeaturedArchive } from '../../types/featured-archive';
import {
  FEATURED_ARCHIVE_API,
  FeaturedArchiveApi,
} from '../../types/featured-archive-api';
import { GalleryModule } from '../../gallery.module';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';
import { DebugElement, Type } from '@angular/core';
import { QueryMatch } from 'shallow-render/dist/lib/models/query-match';
import { ComponentFixture } from '@angular/core/testing';

class DummyFeaturedArchiveAPI implements FeaturedArchiveApi {
  public static FeaturedArchives: FeaturedArchive[] = [];
  public static reset(): void {
    DummyFeaturedArchiveAPI.FeaturedArchives = [];
  }

  public fetchedFromApi: boolean = false;

  public async getFeaturedArchiveList(): Promise<FeaturedArchive[]> {
    this.fetchedFromApi = true;
    return DummyFeaturedArchiveAPI.FeaturedArchives;
  }
}

fdescribe('GalleryComponent', () => {
  let shallow: Shallow<GalleryComponent>;
  let dummyApi: DummyFeaturedArchiveAPI;

  beforeEach(async () => {
    DummyFeaturedArchiveAPI.reset();
    dummyApi = new DummyFeaturedArchiveAPI();
    shallow = new Shallow(GalleryComponent, GalleryModule);
    shallow.provide({
      provide: FEATURED_ARCHIVE_API,
      useValue: dummyApi,
    });
    shallow.dontMock(FEATURED_ARCHIVE_API);
  });

  it('should be able to get a list of featured archives', async () => {
    const { instance } = await shallow.render();
    expect(await instance.getFeaturedArchives()).toBeTruthy();
  });

  it('should fetch featured archives from the API', async () => {
    await shallow.render();
    expect(dummyApi.fetchedFromApi).toBeTrue();
  });

  it('displays the list of featured archives', async () => {
    DummyFeaturedArchiveAPI.FeaturedArchives = [
      {
        archiveNbr: '0000-0000',
        name: 'Unit Testing',
        type: 'type.archive.person',
        thumbUrl: 'thumbUrl',
        bannerUrl: 'bannerUrl',
      },
    ];
    const { fixture, find } = await shallow.render();
    await fixture.whenStable();
    expect(find('pr-featured-archive').length).toBe(1);
  });

  it('displays an error message if no featured archives exist', async () => {
    const { find } = await shallow.render();
    expect(find('pr-featured-archive').length).toBe(0);
    expect(find('.null-message').length).toBe(1);
  });
});
