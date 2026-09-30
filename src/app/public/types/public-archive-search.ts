import { StelaTag } from '@shared/services/api/record.repo';

// Mirrors the response of stela's GET /v2/archives/public/search
// (packages/api/src/archive/models.ts). `archiveNumber` and `folderLinkId` are
// not yet returned by stela; they are needed to build public archive URLs.

export interface PublicArchiveSearchArchive {
	id: string;
	name: string;
	archiveNumber: string;
	thumbnailUrls: {
		width200: string | null;
		width500: string | null;
		width1000: string | null;
		width2000: string | null;
	};
}

export interface PublicArchiveSearchMilestone {
	id: string;
	title: string;
	description: string | null;
	date: string | null;
}

export interface PublicArchiveSearchItem {
	id: string;
	itemType: 'folder' | 'record';
	displayName: string;
	displayTime: string | null;
	archiveNumber: string;
	folderLinkId?: string;
	thumbnailUrls: {
		width200: string | null;
		width256: string | null;
		width500: string | null;
		width1000: string | null;
		width2000: string | null;
	};
}

export interface ArchiveNameMatch {
	matchType: 'archiveName';
}

export interface MilestoneMatch {
	matchType: 'milestone';
	matchedFields: Array<'title' | 'description'>;
	milestone: PublicArchiveSearchMilestone;
}

export interface ItemMatch {
	matchType: 'item';
	matchedFields: Array<'name' | 'description' | 'tagName' | 'tagType'>;
	item: PublicArchiveSearchItem;
	matchedTags?: StelaTag[];
}

export type PublicArchiveSearchMatch =
	| ArchiveNameMatch
	| MilestoneMatch
	| ItemMatch;

export interface PublicArchiveSearchResult {
	archive: PublicArchiveSearchArchive;
	totalMatchCount: number;
	matches: PublicArchiveSearchMatch[];
}

export interface SearchPublicArchivesResponse {
	items: PublicArchiveSearchResult[];
	pagination: {
		nextCursor?: string;
		nextPage?: string;
		totalPages: number;
	};
}
