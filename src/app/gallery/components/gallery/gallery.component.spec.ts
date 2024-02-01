/* @format */
import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { FeaturedArchive } from '../../types/featured-archive';
import {
  FEATURED_ARCHIVE_API,
  FeaturedArchiveApi,
} from '../../types/featured-archive-api';
import { GalleryModule } from '../../gallery.module';
import { GalleryComponent } from './gallery.component';

class DummyFeaturedArchiveAPI implements FeaturedArchiveApi {
  public static failRequest = false;
  public static FeaturedArchives: FeaturedArchive[] = [];
  public static reset(): void {
    DummyFeaturedArchiveAPI.FeaturedArchives = [];
    DummyFeaturedArchiveAPI.failRequest = false;
  }

  public fetchedFromApi: boolean = false;

  public async getFeaturedArchiveList(): Promise<FeaturedArchive[]> {
    if (DummyFeaturedArchiveAPI.failRequest) {
      throw new Error('Forced unit test error');
    }
    this.fetchedFromApi = true;
    return DummyFeaturedArchiveAPI.FeaturedArchives;
  }
}

class DummyAccountService {
  public static loggedIn: boolean = false;

  public isLoggedIn(): boolean {
    return DummyAccountService.loggedIn;
  }
}

const testArchive: FeaturedArchive = {
  archiveNbr: '0000-0000',
  name: 'Unit Testing',
  type: 'type.archive.person',
  profileImage: 'thumbUrl',
  bannerImage: 'bannerUrl',
} as const;

describe('GalleryComponent', () => {
  let shallow: Shallow<GalleryComponent>;
  let dummyApi: DummyFeaturedArchiveAPI;
  let dummyAccount: DummyAccountService;

  beforeEach(async () => {
    DummyFeaturedArchiveAPI.reset();
    DummyAccountService.loggedIn = false;
    dummyApi = new DummyFeaturedArchiveAPI();
    dummyAccount = new DummyAccountService();
    shallow = new Shallow(GalleryComponent, GalleryModule);
    shallow
      .provide({
        provide: FEATURED_ARCHIVE_API,
        useValue: dummyApi,
      })
      .provide({
        provide: AccountService,
        useValue: dummyAccount,
      });
    shallow.dontMock(FEATURED_ARCHIVE_API, AccountService);
  });

  it('should fetch featured archives from the API', async () => {
    await shallow.render();

    expect(dummyApi.fetchedFromApi).toBeTrue();
  });

  it('displays the list of featured archives', async () => {
    DummyFeaturedArchiveAPI.FeaturedArchives = [testArchive];
    const { fixture, find } = await shallow.render();
    await fixture.whenStable();

    expect(find('pr-featured-archive').length).toBe(1);
  });

  it('does not display the error message while loading the archives', async () => {
    DummyFeaturedArchiveAPI.FeaturedArchives = [testArchive];
    const { find, instance } = await shallow.render();
    instance.loading = true;

    expect(find('.null-message').length).toBe(0);
  });

  it('displays an error message if no featured archives exist', async () => {
    const { find } = await shallow.render();

    expect(find('pr-featured-archive').length).toBe(0);
    expect(find('.null-message').length).toBe(1);
  });

  it('displays an error message if the fetch failed', async () => {
    DummyFeaturedArchiveAPI.FeaturedArchives = [testArchive];
    DummyFeaturedArchiveAPI.failRequest = true;
    const { find } = await shallow.render();

    expect(find('.null-message').length).toBe(1);
  });

  it("does not display the user's public archives list if logged out", async () => {
    const { find } = await shallow.render();

    expect(find('pr-public-archives-list').length).toBe(0);
  });

  it("displays the user's public archives list if logged in", async () => {
    DummyAccountService.loggedIn = true;
    const { find } = await shallow.render();

    expect(find('pr-public-archives-list').length).toBe(1);
  });
});
