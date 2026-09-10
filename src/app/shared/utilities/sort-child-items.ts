import { ItemVO } from '@root/app/models';
import { SortType } from '@models/vo-types';

type CompareItems = (firstItem: ItemVO, secondItem: ItemVO) => number;

interface SortRule {
	compare: CompareItems;
	descending: boolean;
	tiebreak?: CompareItems;
}

const compareDisplayNames: CompareItems = (firstItem, secondItem) =>
	String(firstItem.displayName ?? '').localeCompare(
		String(secondItem.displayName ?? ''),
	);

const compareTypes: CompareItems = (firstItem, secondItem) =>
	String(firstItem.type ?? '').localeCompare(String(secondItem.type ?? ''));

// Postgres sorts NULL after every non-null value, so an undated item lands last
// ascending and first descending. Parsing a missing date to +Infinity gives the
// same result once the direction is applied.
const toSortableTime = (displayDT: unknown): number => {
	const parsedTime =
		typeof displayDT === 'string' ? Date.parse(displayDT) : Number.NaN;

	return Number.isNaN(parsedTime) ? Number.POSITIVE_INFINITY : parsedTime;
};

const compareDisplayDates: CompareItems = (firstItem, secondItem) => {
	const firstTime = toSortableTime(firstItem.displayDT);
	const secondTime = toSortableTime(secondItem.displayDT);
	if (firstTime === secondTime) {
		return 0;
	}

	return firstTime < secondTime ? -1 : 1;
};

const SORT_RULES = new Map<SortType, SortRule>([
	[
		'sort.alphabetical_asc',
		{ compare: compareDisplayNames, descending: false },
	],
	[
		'sort.alphabetical_desc',
		{ compare: compareDisplayNames, descending: true },
	],
	[
		'sort.display_date_asc',
		{
			compare: compareDisplayDates,
			descending: false,
			tiebreak: compareDisplayNames,
		},
	],
	[
		'sort.display_date_desc',
		{
			compare: compareDisplayDates,
			descending: true,
			tiebreak: compareDisplayNames,
		},
	],
	[
		'sort.type_asc',
		{ compare: compareTypes, descending: false, tiebreak: compareDisplayNames },
	],
	[
		'sort.type_desc',
		{ compare: compareTypes, descending: true, tiebreak: compareDisplayNames },
	],
]);

/**
 * Orders child items the way stela's children endpoint does for a sort type,
 * so a sort can be previewed before it is saved on the folder. Returns a new
 * array holding the same item references; an unknown sort keeps the order.
 */
export const sortChildItems = (
	items: ItemVO[],
	sort: SortType | undefined,
): ItemVO[] => {
	const sortRule = sort ? SORT_RULES.get(sort) : undefined;
	if (!sortRule) {
		return [...items];
	}

	const direction = sortRule.descending ? -1 : 1;

	return [...items].sort((firstItem, secondItem) => {
		const primaryOrder = sortRule.compare(firstItem, secondItem) * direction;
		if (primaryOrder !== 0 || !sortRule.tiebreak) {
			return primaryOrder;
		}

		return sortRule.tiebreak(firstItem, secondItem);
	});
};
