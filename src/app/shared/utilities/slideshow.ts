import { FolderVO } from '@models';

type SlideshowRootUrl = '/app/private' | '/app/public';

// The slideshow route only exists under the private and public file browsers
export function getSlideshowRootUrl(url: string): SlideshowRootUrl | undefined {
	const match = /^\/app\/(private|public)(?=[/?#;]|$)/.exec(url ?? '');
	return match ? (`/app/${match[1]}` as SlideshowRootUrl) : undefined;
}

export function canStartSlideshow(url: string, folder: FolderVO): boolean {
	return (
		!!folder &&
		!!getSlideshowRootUrl(url) &&
		!folder.type?.includes('app') &&
		!folder.type?.includes('root.share')
	);
}

export function getSlideshowRoute(url: string, folder: FolderVO): string[] {
	return [
		getSlideshowRootUrl(url),
		'view',
		'slideshow',
		folder.archiveNbr,
		folder.folder_linkId?.toString(),
	];
}
