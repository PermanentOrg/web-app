/* @format */
import { Shallow } from 'shallow-render';
import { GalleryComponent } from './gallery.component';
import { FeaturedArchive } from '../../types/featured-archive';
import {
  FEATURED_ARCHIVE_API,
  FeaturedArchiveApi,
} from '../../types/featured-archive-api';
import { GalleryModule } from '../../gallery.module';

class DummyFeaturedArchiveAPI implements FeaturedArchiveApi {
  public fetchedFromApi: boolean = false;
  public async getFeaturedArchiveList(): Promise<FeaturedArchive[]> {
    this.fetchedFromApi = true;
    return [];
  }
}

fdescribe('GalleryComponent', () => {
  let shallow: Shallow<GalleryComponent>;
  let component: GalleryComponent;
  let dummyApi: DummyFeaturedArchiveAPI;

  beforeEach(async () => {
    dummyApi = new DummyFeaturedArchiveAPI();
    shallow = new Shallow(GalleryComponent, GalleryModule);
    shallow.provide({
      provide: FEATURED_ARCHIVE_API,
      useValue: dummyApi,
    });
    shallow.dontMock(FEATURED_ARCHIVE_API);
    component = (await shallow.render()).instance;
  });

  it('should be able to get a list of featured archives', async () => {
    expect(await component.getFeaturedArchives()).toBeTruthy();
  });

  it('should fetch featured archiveds from the API', async () => {
    await component.getFeaturedArchives();
    expect(dummyApi.fetchedFromApi).toBeTrue();
  });
});
