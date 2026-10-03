import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';
import { ArchiveAvatarComponent } from './archive-avatar.component';

const THUMBNAIL_URL = 'https://example.com/thumb.jpg';

describe('ArchiveAvatarComponent', () => {
	let fixture: MockedComponentFixture<
		ArchiveAvatarComponent,
		{ thumbnailUrl: string | undefined; archiveName: string | undefined }
	>;

	const render = (
		thumbnailUrl: string | undefined,
		archiveName: string | undefined = 'memories',
	): void => {
		fixture = MockRender(
			'<pr-archive-avatar [thumbnailUrl]="thumbnailUrl" [archiveName]="archiveName"></pr-archive-avatar>',
			{ thumbnailUrl, archiveName },
		);
	};

	const initial = (): string =>
		fixture.nativeElement
			.querySelector('.archive-avatar-initial')
			.textContent.trim();

	const thumbnail = (): HTMLImageElement | null =>
		fixture.nativeElement.querySelector('.archive-avatar-thumbnail');

	const fireThumbnailEvent = (eventName: 'load' | 'error'): void => {
		thumbnail().dispatchEvent(new Event(eventName));
		fixture.detectChanges();
	};

	beforeEach(async () => {
		await MockBuilder(ArchiveAvatarComponent);
	});

	it('should show the capitalised first letter of the archive name', () => {
		render(undefined, '  memories');

		expect(initial()).toBe('M');
	});

	it('should show no letter when the archive name is blank', () => {
		render(undefined, '   ');

		expect(initial()).toBe('');
	});

	it('should not try to load a thumbnail when there is none', () => {
		render(undefined);

		expect(thumbnail()).toBeNull();
	});

	it('should keep the thumbnail hidden over the letter until it loads', () => {
		render(THUMBNAIL_URL);

		expect(thumbnail().src).toBe(THUMBNAIL_URL);
		expect(thumbnail().classList).not.toContain('loaded');

		fireThumbnailEvent('load');

		expect(thumbnail().classList).toContain('loaded');
	});

	it('should fall back to the letter when the thumbnail fails to load', () => {
		render(THUMBNAIL_URL);
		fireThumbnailEvent('error');

		expect(thumbnail()).toBeNull();
		expect(initial()).toBe('M');
	});

	it('should try again when it is given a new thumbnail after a failure', () => {
		render(THUMBNAIL_URL);
		fireThumbnailEvent('error');

		fixture.componentInstance.thumbnailUrl = 'https://example.com/new.jpg';
		fixture.detectChanges();

		expect(thumbnail().src).toBe('https://example.com/new.jpg');
		expect(thumbnail().classList).not.toContain('loaded');
	});
});
