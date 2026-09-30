import { FolderVO } from '@models';
import {
	canStartSlideshow,
	getSlideshowRootUrl,
	getSlideshowRoute,
} from './slideshow';

describe('slideshow utilities', () => {
	describe('getSlideshowRootUrl', () => {
		it('recognizes the private and public file browsers', () => {
			expect(getSlideshowRootUrl('/app/private')).toBe('/app/private');
			expect(getSlideshowRootUrl('/app/private/0001-0001/42')).toBe(
				'/app/private',
			);

			expect(getSlideshowRootUrl('/app/public?foo=bar')).toBe('/app/public');
			expect(getSlideshowRootUrl('/app/public/view/grid/0001-0001/42')).toBe(
				'/app/public',
			);
		});

		it('ignores other sections of the app', () => {
			expect(getSlideshowRootUrl('/app/shares/0001-0001/42')).toBeUndefined();
			expect(getSlideshowRootUrl('/app/apps')).toBeUndefined();
			expect(getSlideshowRootUrl('/p/archive/0001-0001')).toBeUndefined();
			expect(getSlideshowRootUrl('/share/abc/view')).toBeUndefined();
			expect(getSlideshowRootUrl('/app/privateer')).toBeUndefined();
			expect(getSlideshowRootUrl(undefined)).toBeUndefined();
		});
	});

	describe('canStartSlideshow', () => {
		it('allows regular folders in the file browser', () => {
			const folder = new FolderVO({ type: 'type.folder.private' });

			expect(canStartSlideshow('/app/private/0001-0001/42', folder)).toBeTrue();
		});

		it('disallows special folders and missing folders', () => {
			expect(
				canStartSlideshow(
					'/app/private',
					new FolderVO({ type: 'type.folder.root.share' }),
				),
			).toBeFalse();

			expect(
				canStartSlideshow(
					'/app/private',
					new FolderVO({ type: 'type.folder.app' }),
				),
			).toBeFalse();

			expect(canStartSlideshow('/app/private', undefined)).toBeFalse();
		});

		it('disallows folders outside the file browser', () => {
			const folder = new FolderVO({ type: 'type.folder.private' });

			expect(canStartSlideshow('/app/shares/0001-0001/42', folder)).toBeFalse();
		});
	});

	it('builds the slideshow route for a folder', () => {
		const folder = new FolderVO({ archiveNbr: '0001-0001', folder_linkId: 42 });

		expect(getSlideshowRoute('/app/public/0001-0001/42', folder)).toEqual([
			'/app/public',
			'view',
			'slideshow',
			'0001-0001',
			'42',
		]);
	});
});
