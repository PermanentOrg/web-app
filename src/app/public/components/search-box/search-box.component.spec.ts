import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
	TestBed,
	ComponentFixture,
	fakeAsync,
	tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { of, throwError } from 'rxjs';
import { ApiService } from '@shared/services/api/api.service';
import {
	PublicArchiveSearchResult,
	SearchPublicArchivesResponse,
} from '@public/types/public-archive-search';
import { SearchBoxComponent } from './search-box.component';

const thumbnailUrls = {
	width200: null,
	width500: null,
	width1000: null,
	width2000: null,
};

const smithResult: PublicArchiveSearchResult = {
	archive: {
		id: '1',
		name: 'Smith Family',
		archiveNumber: '0001-0000',
		thumbnailUrls,
	},
	totalMatchCount: 1,
	matches: [{ matchType: 'archiveName' }],
};

const searchResponse = (
	items: PublicArchiveSearchResult[],
): SearchPublicArchivesResponse => ({
	items,
	pagination: { totalPages: 1 },
});

describe('SearchBoxComponent', () => {
	let fixture: ComponentFixture<SearchBoxComponent>;
	let component: SearchBoxComponent;
	let publicArchivesObservable: jasmine.Spy;
	let navigate: jasmine.Spy;

	const search = (query: string) => {
		component.searchForm.setValue({ query });
		tick(100);
		fixture.detectChanges();
	};

	const pressKey = (keyCode: number) => {
		const event = new KeyboardEvent('keydown');
		Object.defineProperty(event, 'keyCode', { value: keyCode });
		component.searchInputRef.nativeElement.dispatchEvent(event);
	};

	beforeEach(async () => {
		publicArchivesObservable = jasmine
			.createSpy('publicArchivesObservable')
			.and.returnValue(of(searchResponse([smithResult])));
		navigate = jasmine.createSpy('navigate');

		await TestBed.configureTestingModule({
			imports: [ReactiveFormsModule],
			declarations: [SearchBoxComponent],
			providers: [
				{
					provide: ApiService,
					useValue: { search: { publicArchivesObservable } },
				},
				{ provide: Router, useValue: { navigate } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(SearchBoxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should exist', () => {
		expect(component).toBeTruthy();
	});

	it('does not search for fewer than 3 characters', fakeAsync(() => {
		search('sm');

		expect(publicArchivesObservable).not.toHaveBeenCalled();
		expect(component.showResults).toBeFalse();
	}));

	it('searches public archives with the trimmed query', fakeAsync(() => {
		search('  smi  ');

		expect(publicArchivesObservable).toHaveBeenCalledWith('smi', 10);
		expect(component.archiveResults).toEqual([smithResult]);
		expect(
			fixture.nativeElement.querySelectorAll('pr-public-archive-search-result')
				.length,
		).toBe(1);
	}));

	it('shows a message when no archives match', fakeAsync(() => {
		publicArchivesObservable.and.returnValue(of(searchResponse([])));

		search('nobody');

		expect(fixture.nativeElement.textContent).toContain('No archives found');
	}));

	it('hides results when the search fails', fakeAsync(() => {
		publicArchivesObservable.and.returnValue(
			throwError(() => new Error('failed')),
		);

		search('smith');

		expect(component.showResults).toBeFalse();
		expect(component.waiting).toBeFalse();

		publicArchivesObservable.and.returnValue(of(searchResponse([smithResult])));
		search('smiths');

		expect(component.archiveResults).toEqual([smithResult]);
	}));

	it('opens the highlighted archive on Enter', fakeAsync(() => {
		search('smith');

		pressKey(DOWN_ARROW);
		pressKey(ENTER);

		expect(navigate).toHaveBeenCalledWith(['/p', 'archive', '0001-0000']);
	}));

	it('does nothing on Enter when no result is highlighted', fakeAsync(() => {
		search('smith');

		pressKey(ENTER);

		expect(navigate).not.toHaveBeenCalled();
	}));

	it('opens the profile for a milestone match', () => {
		component.onMatchClick(smithResult, {
			matchType: 'milestone',
			matchedFields: ['title'],
			milestone: { id: '5', title: 'Born', description: null, date: null },
		});

		expect(navigate).toHaveBeenCalledWith([
			'/p',
			'archive',
			'0001-0000',
			'profile',
		]);
	});

	it('opens a record match', () => {
		component.onMatchClick(smithResult, {
			matchType: 'item',
			matchedFields: ['name'],
			item: {
				id: '7',
				itemType: 'record',
				displayName: 'Letter',
				displayTime: null,
				archiveNumber: '0001-00ab',
				thumbnailUrls: { ...thumbnailUrls, width256: null },
			},
		});

		expect(navigate).toHaveBeenCalledWith([
			'/p',
			'archive',
			'0001-0000',
			'record',
			'0001-00ab',
		]);
	});

	it('opens a folder match', () => {
		component.onMatchClick(smithResult, {
			matchType: 'item',
			matchedFields: ['name'],
			item: {
				id: '8',
				itemType: 'folder',
				displayName: 'Photos',
				displayTime: null,
				archiveNumber: '0001-00cd',
				folderLinkId: '42',
				thumbnailUrls: { ...thumbnailUrls, width256: null },
			},
		});

		expect(navigate).toHaveBeenCalledWith([
			'/p',
			'archive',
			'0001-0000',
			'0001-00cd',
			'42',
		]);
	});
});
