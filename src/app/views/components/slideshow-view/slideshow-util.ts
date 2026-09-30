import { ItemVO, RecordVO } from '@models';

export function getSlideshowImages(items: ItemVO[] = []): RecordVO[] {
	return items.filter(
		(item): item is RecordVO => item.isRecord && !!item.type?.includes('image'),
	);
}
