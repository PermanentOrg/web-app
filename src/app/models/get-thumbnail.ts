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

export function GetThumbnail(
  item: HasThumbnails,
  minimumSize: number,
): string | undefined {
  const thumbnails: ThumbnailData[] = [
    { size: 200, url: item.thumbURL200 },
    { size: 256, url: item.thumbnail256 },
    { size: 500, url: item.thumbURL500 },
    { size: 1000, url: item.thumbURL1000 },
    { size: 2000, url: item.thumbURL2000 },
  ].filter((thumb) => thumb.url);
  return (
    thumbnails.find((thumb) => thumb.size >= minimumSize)?.url ||
    thumbnails[0]?.url
  );
}
