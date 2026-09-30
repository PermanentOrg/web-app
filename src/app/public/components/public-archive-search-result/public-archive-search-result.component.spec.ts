import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
	ItemMatch,
	MilestoneMatch,
	PublicArchiveSearchResult,
} from '@public/types/public-archive-search';
import { PublicArchiveSearchResultComponent } from './public-archive-search-result.component';

const milestoneMatch: MilestoneMatch = {
	matchType: 'milestone',
	matchedFields: ['title'],
	milestone: {
		id: '5',
		title: 'Moved to Chicago',
		description: null,
		date: '1942',
	},
};

const itemMatch = (displayName: string, thumbnail: string = null): ItemMatch => ({
	matchType: 'item',
	matchedFields: ['tagName'],
	item: {
		id: displayName,
		itemType: 'folder',
		displayName,
		displayTime: null,
		archiveNumber: '0001-00cd',
		folderLinkId: '42',
		thumbnailUrls: {
			width200: thumbnail,
			width256: null,
			width500: null,
			width1000: null,
			width2000: null,
		},
	},
	matchedTags: [{ id: '9', name: 'Chicago', type: 'type.generic.placeholder' }],
});

const buildResult = (
	overrides: Partial<PublicArchiveSearchResult> = {},
): PublicArchiveSearchResult => ({
	archive: {
		id: '1',
		name: 'Smith Family',
		archiveNumber: '0001-0000',
		thumbnailUrls: {
			width200: null,
			width500: null,
			width1000: null,
			width2000: null,
		},
	},
	totalMatchCount: 2,
	matches: [{ matchType: 'archiveName' }, milestoneMatch],
	...overrides,
});

describe('PublicArchiveSearchResultComponent', () => {
	let fixture: ComponentFixture<PublicArchiveSearchResultComponent>;
	let component: PublicArchiveSearchResultComponent;

	const render = (result: PublicArchiveSearchResult, maxMatches = 3) => {
		fixture.componentRef.setInput('result', result);
		fixture.componentRef.setInput('maxMatches', maxMatches);
		fixture.detectChanges();
	};

	const text = (): string => fixture.nativeElement.textContent;
	const matchElements = (): HTMLElement[] =>
		Array.from(fixture.nativeElement.querySelectorAll('.match'));

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PublicArchiveSearchResultComponent],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(PublicArchiveSearchResultComponent);
		component = fixture.componentInstance;
	});

	it('shows the archive name', () => {
		render(buildResult());

		expect(text()).toContain('The Smith Family Archive');
	});

	it('does not list an archive name match as its own line', () => {
		render(buildResult({ totalMatchCount: 1, matches: [{ matchType: 'archiveName' }] }));

		expect(matchElements().length).toBe(0);
		expect(fixture.nativeElement.querySelector('.more-matches')).toBeNull();
	});

	it('shows a milestone match with its date', () => {
		render(buildResult());

		expect(matchElements().length).toBe(1);
		expect(text()).toContain('Moved to Chicago');
		expect(text()).toContain('1942');
	});

	it('shows an item match with its matched tag', () => {
		render(
			buildResult({ totalMatchCount: 1, matches: [itemMatch('Photos')] }),
		);

		expect(text()).toContain('Photos');
		expect(text()).toContain('tagged Chicago');
	});

	it('shows a folder icon when an item has no thumbnail', () => {
		render(
			buildResult({ totalMatchCount: 1, matches: [itemMatch('Photos')] }),
		);

		expect(fixture.nativeElement.querySelector('.match-icon').textContent).toBe(
			'folder',
		);
	});

	it('omits the icon when an item has a thumbnail', () => {
		render(
			buildResult({
				totalMatchCount: 1,
				matches: [itemMatch('Photos', 'https://example.com/thumb.jpg')],
			}),
		);

		expect(fixture.nativeElement.querySelector('.match-icon')).toBeNull();
	});

	it('limits the matches shown and counts the rest', () => {
		render(
			buildResult({
				totalMatchCount: 25,
				matches: [
					{ matchType: 'archiveName' },
					itemMatch('One'),
					itemMatch('Two'),
					itemMatch('Three'),
				],
			}),
			2,
		);

		expect(matchElements().length).toBe(2);
		expect(text()).toContain('+22 more matches');
	});

	it('emits the archive when the archive is clicked', () => {
		const result = buildResult();
		render(result);
		const emitted = spyOn(component.archiveClick, 'emit');

		fixture.nativeElement.querySelector('.archive').click();

		expect(emitted).toHaveBeenCalledWith(result);
	});

	it('emits only the match when a match is clicked', () => {
		render(buildResult());
		const archiveEmitted = spyOn(component.archiveClick, 'emit');
		const matchEmitted = spyOn(component.matchClick, 'emit');

		matchElements()[0].click();

		expect(matchEmitted).toHaveBeenCalledWith(milestoneMatch);
		expect(archiveEmitted).not.toHaveBeenCalled();
	});
});
