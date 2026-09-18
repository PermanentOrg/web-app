import { FolderVO, ItemVO, RecordVO } from '@root/app/models';
import { sortChildItems } from './sort-child-items';

describe('sortChildItems', () => {
	const folderBerlin = new FolderVO({
		folderId: 1,
		folder_linkId: 1,
		displayName: 'Berlin',
		displayDT: '2021-05-01T00:00:00.000Z',
		type: 'type.folder.private',
	});
	const recordAmsterdam = new RecordVO({
		recordId: 2,
		folder_linkId: 2,
		displayName: 'Amsterdam',
		displayDT: '2023-01-01T00:00:00.000Z',
		type: 'type.record.image',
	});
	const recordCairo = new RecordVO({
		recordId: 3,
		folder_linkId: 3,
		displayName: 'Cairo',
		displayDT: '2019-12-31T00:00:00.000Z',
		type: 'type.record.document',
	});
	const recordUndated = new RecordVO({
		recordId: 4,
		folder_linkId: 4,
		displayName: 'Undated',
		type: 'type.record.image',
	});

	const items: ItemVO[] = [
		folderBerlin,
		recordAmsterdam,
		recordCairo,
		recordUndated,
	];
	const namesOf = (sortedItems: ItemVO[]) =>
		sortedItems.map((item) => item.displayName);

	it('should interleave folders and records by display name ascending', () => {
		expect(namesOf(sortChildItems(items, 'sort.alphabetical_asc'))).toEqual([
			'Amsterdam',
			'Berlin',
			'Cairo',
			'Undated',
		]);
	});

	it('should order by display name descending', () => {
		expect(namesOf(sortChildItems(items, 'sort.alphabetical_desc'))).toEqual([
			'Undated',
			'Cairo',
			'Berlin',
			'Amsterdam',
		]);
	});

	it('should order by display date ascending with undated items last', () => {
		expect(namesOf(sortChildItems(items, 'sort.display_date_asc'))).toEqual([
			'Cairo',
			'Berlin',
			'Amsterdam',
			'Undated',
		]);
	});

	it('should order by display date descending with undated items first', () => {
		expect(namesOf(sortChildItems(items, 'sort.display_date_desc'))).toEqual([
			'Undated',
			'Amsterdam',
			'Berlin',
			'Cairo',
		]);
	});

	it('should order by type ascending and break ties on display name', () => {
		expect(namesOf(sortChildItems(items, 'sort.type_asc'))).toEqual([
			'Berlin',
			'Cairo',
			'Amsterdam',
			'Undated',
		]);
	});

	it('should order by type descending and still break ties on display name ascending', () => {
		expect(namesOf(sortChildItems(items, 'sort.type_desc'))).toEqual([
			'Amsterdam',
			'Undated',
			'Cairo',
			'Berlin',
		]);
	});

	it('should return a new array holding the same item references', () => {
		const sortedItems = sortChildItems(items, 'sort.alphabetical_asc');

		expect(sortedItems).not.toBe(items);
		expect(sortedItems[0]).toBe(recordAmsterdam);
		expect(items[0]).toBe(folderBerlin);
	});

	it('should keep the order for an unknown sort', () => {
		expect(sortChildItems(items, undefined)).toEqual(items);
	});
});
