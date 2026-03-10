interface ThumbnailData {
	size: number;
	url: string;
}
export interface HasThumbnails {
	thumbURL200?: string;
	thumbnail256?: string;
	thumbURL500?: string;
	thumbURL1000?: string;
	thumbURL2000?: string;
}

export function GetThumbnailInfo(
	item: HasThumbnails,
): ThumbnailData | undefined {
	const thumbnails: ThumbnailData[] = [
		{ size: 256, url: item.thumbnail256 },
		{ size: 500, url: item.thumbURL500 },
		{ size: 200, url: item.thumbURL200 },
		{ size: 1000, url: item.thumbURL1000 },
		{ size: 2000, url: item.thumbURL2000 },
	];
	return thumbnails.find((thumb) => thumb.url);
}

export function GetThumbnail(item: HasThumbnails): string | undefined {
	return GetThumbnailInfo(item)?.url;
}

export function GetBannerInfo(item: HasThumbnails): ThumbnailData | undefined {
	const thumbnails: ThumbnailData[] = [
		{ size: 2000, url: item.thumbURL2000 },
		{ size: 1000, url: item.thumbURL1000 },
		{ size: 500, url: item.thumbURL500 },
		{ size: 256, url: item.thumbnail256 },
	];
	return thumbnails.find((thumb) => thumb.url);
}

export function GetBanner(item: HasThumbnails): string | undefined {
	return GetBannerInfo(item)?.url;
}
