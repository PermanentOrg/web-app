interface ThumbnailData {
	size: number;
	url: string;
}
export interface HasThumbnails {
	thumbURL200?: string;
	thumbUrl200?: string;
	thumbnail256?: string;
	thumbURL500?: string;
	thumbUrl500?: string;
	thumbURL1000?: string;
	thumbUrl1000?: string;
	thumbURL2000?: string;
	thumbUrl2000?: string;
}

export function GetThumbnailInfo(
	item: HasThumbnails,
	minimumSize: number,
): ThumbnailData | undefined {
	const thumbnails: ThumbnailData[] = [
		{ size: 200, url: item.thumbUrl200 ?? item.thumbURL200 },
		{ size: 256, url: item.thumbnail256 },
		{ size: 500, url: item.thumbUrl500 ?? item.thumbURL500 },
		{ size: 1000, url: item.thumbUrl1000 ?? item.thumbURL1000 },
		{ size: 2000, url: item.thumbUrl2000 ?? item.thumbURL2000 },
	].filter((thumb) => thumb.url);
	const biggestAvailableThumbnail = thumbnails[thumbnails.length - 1];
	if (minimumSize > biggestAvailableThumbnail?.size) {
		return biggestAvailableThumbnail;
	}
	return thumbnails.find((thumb) => thumb.size >= minimumSize) || thumbnails[0];
}

export function GetThumbnail(
	item: HasThumbnails,
	minimumSize: number,
): string | undefined {
	return GetThumbnailInfo(item, minimumSize)?.url;
}
