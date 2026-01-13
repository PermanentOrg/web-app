import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AccountService } from '@shared/services/account/account.service';
import { EventService } from '@shared/services/event/event.service';
import { FeaturedArchive } from '../../types/featured-archive';
import {
	FEATURED_ARCHIVE_API,
	FeaturedArchiveApi,
} from '../../types/featured-archive-api';
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
	let fixture: ComponentFixture<GalleryComponent>;
	let component: GalleryComponent;
	let dummyApi: DummyFeaturedArchiveAPI;

	beforeEach(async () => {
		DummyFeaturedArchiveAPI.reset();
		DummyAccountService.loggedIn = false;
		dummyApi = new DummyFeaturedArchiveAPI();

		await TestBed.configureTestingModule({
			declarations: [GalleryComponent],
			providers: [
				{
					provide: FEATURED_ARCHIVE_API,
					useValue: dummyApi,
				},
				{
					provide: AccountService,
					useClass: DummyAccountService,
				},
				{
					provide: EventService,
					useValue: { dispatch: () => {} },
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(GalleryComponent);
		component = fixture.componentInstance;
	});

	it('should fetch featured archives from the API', async () => {
		fixture.detectChanges();
		await fixture.whenStable();

		expect(dummyApi.fetchedFromApi).toBeTrue();
	});

	it('displays the list of featured archives', async () => {
		DummyFeaturedArchiveAPI.FeaturedArchives = [testArchive];
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		const featuredArchives = fixture.nativeElement.querySelectorAll(
			'pr-featured-archive',
		);

		expect(featuredArchives.length).toBe(1);
	});

	it('does not display the error message while loading the archives', () => {
		DummyFeaturedArchiveAPI.FeaturedArchives = [testArchive];
		fixture.detectChanges();
		component.loading = true;
		fixture.detectChanges();

		const nullMessage = fixture.nativeElement.querySelector('.null-message');

		expect(nullMessage).toBeFalsy();
	});

	it('displays an error message if no featured archives exist', async () => {
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		const featuredArchives = fixture.nativeElement.querySelectorAll(
			'pr-featured-archive',
		);
		const nullMessage = fixture.nativeElement.querySelector('.null-message');

		expect(featuredArchives.length).toBe(0);
		expect(nullMessage).toBeTruthy();
	});

	it('displays an error message if the fetch failed', async () => {
		DummyFeaturedArchiveAPI.FeaturedArchives = [testArchive];
		DummyFeaturedArchiveAPI.failRequest = true;
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		const nullMessage = fixture.nativeElement.querySelector('.null-message');

		expect(nullMessage).toBeTruthy();
	});

	it("does not display the user's public archives list if logged out", async () => {
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		const publicArchivesList = fixture.nativeElement.querySelector(
			'pr-public-archives-list',
		);

		expect(publicArchivesList).toBeFalsy();
	});

	it("displays the user's public archives list if logged in", async () => {
		DummyAccountService.loggedIn = true;
		// Need to recreate the component since isLoggedIn is called in constructor
		fixture = TestBed.createComponent(GalleryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		const publicArchivesList = fixture.nativeElement.querySelector(
			'pr-public-archives-list',
		);

		expect(publicArchivesList).toBeTruthy();
	});
});
