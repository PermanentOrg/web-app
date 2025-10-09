import {
	Component,
	ViewChild,
	ElementRef,
	HostBinding,
	Inject,
	DOCUMENT,
} from '@angular/core';
import { SearchService } from '@search/services/search.service';
import { ItemVO, RecordVO, TagVOData } from '@models';
import { DataService } from '@shared/services/data/data.service';
import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { ngIfScaleHeightEnterAnimation } from '@shared/animations';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { of } from 'rxjs';
import { tap, debounceTime, switchMap, catchError, map } from 'rxjs/operators';
import { SearchResponse } from '@shared/services/api/index.repo';

import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { remove } from 'lodash';

const LOCAL_RESULTS_LIMIT = 5;

type ResultsListType = 'local' | 'global' | 'tag';

@Component({
	selector: 'pr-global-search-bar',
	templateUrl: './global-search-bar.component.html',
	styleUrls: ['./global-search-bar.component.scss'],
	animations: [ngIfScaleHeightEnterAnimation],
	standalone: false,
})
export class GlobalSearchBarComponent {
	public searchTerm: string;

	public localResults: ItemVO[];
	public globalResults: ItemVO[];
	public tagResults: TagVOData[];

	public localResultsByArchiveNbr: Set<string> = new Set();
	public localResultsByRecordId: Set<string> = new Set();
	public localResultsByFolderId: Set<string> = new Set();

	public waiting = false;
	public serverError = false;

	@ViewChild('searchInput') inputElementRef: ElementRef;
	public formControl: UntypedFormControl;

	@HostBinding('class.showing-results') public showResults = false;
	public isFocused = false;

	public activeResultIndex = -1;

	constructor(
		private searchService: SearchService,
		private data: DataService,
		private fb: UntypedFormBuilder,
		private account: AccountService,
		private router: Router,
		@Inject(DOCUMENT) private document: Document,
	) {
		this.formControl = this.fb.control('');
		this.initFormHandler();
	}

	initFormHandler() {
		this.formControl.valueChanges
			.pipe(
				map((term) => this.searchService.parseSearchTerm(term)),
				tap(([term, tags]) => {
					this.showResults = true;
					this.updateLocalResults(term as string, tags);
					this.updateTagsResults(term as string, tags);
				}),
				debounceTime(100),
				switchMap(([term, tags]) => {
					if (term?.length || tags?.length) {
						this.waiting = true;
						return this.searchService
							.getResultsInCurrentArchive(term, tags, 10)
							.pipe(catchError((err) => of(err)));
					} else {
						return of(null);
					}
				}),
			)
			.subscribe((response) => {
				this.waiting = false;
				if (response) {
					if (response instanceof SearchResponse && response.isSuccessful) {
						this.globalResults = response
							.getItemVOs()
							.filter((i) => {
								let showShouldInGlobal = false;
								const inCurrentFolder =
									i.parentFolder_linkId ===
									this.data.currentFolder?.folder_linkId;
								if (i instanceof RecordVO) {
									showShouldInGlobal = !this.localResultsByRecordId.has(
										i.recordId,
									);
								} else {
									showShouldInGlobal =
										!this.localResultsByFolderId.has(i.folderId) &&
										this.data.currentFolder?.folderId !== i.folderId;
								}

								if (showShouldInGlobal && inCurrentFolder) {
									this.localResults?.push(i);
									return false;
								} else {
									return showShouldInGlobal;
								}
							})
							.slice(
								0,
								2 * LOCAL_RESULTS_LIMIT - (this.localResults?.length || 0),
							);
					} else {
						this.globalResults = [];
					}
				} else {
					this.reset();
				}
			});
	}

	resultTrackByFn(index, item: ItemVO) {
		return item.folder_linkId;
	}

	setBodyClass() {
		if (this.isFocused) {
			this.document.documentElement.classList.add('global-search-active');
		} else {
			this.document.documentElement.classList.remove('global-search-active');
		}
	}

	onInputFocus() {
		this.isFocused = true;
		this.setBodyClass();
	}

	onCoverClick() {
		this.isFocused = false;
		this.reset();
		this.setBodyClass();
	}

	onInputKeydown(event: KeyboardEvent) {
		if (!this.localResults && !this.globalResults) {
			return;
		}

		const isArrow = event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW;
		const isEnter = event.keyCode === ENTER;

		const localLength = this.localResults?.length || 0;
		const globalLength = this.globalResults?.length || 0;
		const totalLength = localLength + globalLength;

		if (!(isArrow || isEnter) || !totalLength) {
			return;
		}

		if (isArrow) {
			const direction = event.keyCode === DOWN_ARROW ? 1 : -1;
			const newActiveResultIndex = this.activeResultIndex + direction;
			this.activeResultIndex = Math.min(
				Math.max(-1, newActiveResultIndex),
				totalLength - 1,
			);
		} else if (event.keyCode === ENTER) {
			this.onInputEnter();
		}
	}

	onInputEnter() {
		const localLength = this.localResults?.length || 0;
		const globalLength = this.globalResults?.length || 0;
		const totalLength = localLength + globalLength;

		if (this.activeResultIndex === -1) {
			this.onAllResultsClick();
		} else if (
			-1 < this.activeResultIndex &&
			this.activeResultIndex < localLength
		) {
			this.onLocalResultClick(this.localResults[this.activeResultIndex]);
		} else if (
			localLength <= this.activeResultIndex &&
			this.activeResultIndex < totalLength
		) {
			this.onGlobalResultClick(
				this.globalResults[this.activeResultIndex - localLength],
			);
		}
		this.reset();
		setTimeout(() => {
			(this.inputElementRef.nativeElement as HTMLInputElement).blur();
		}, 100);
	}

	isSelectedResult(list: ResultsListType, listIndex: number) {
		let offset = 0;

		switch (list) {
			case 'global':
				offset = this.localResults.length;
		}

		return this.activeResultIndex - offset === listIndex;
	}

	reset() {
		this.showResults = false;
		this.localResults = null;
		this.localResultsByFolderId.clear();
		this.localResultsByRecordId.clear();
		this.globalResults = null;
		this.activeResultIndex = -1;
		this.formControl.setValue('', { emitEvent: false });
	}

	updateLocalResults(term: string, tags: TagVOData[]) {
		this.localResultsByFolderId.clear();
		this.localResultsByRecordId.clear();

		if (tags?.length) {
			this.localResults = [];
		} else {
			this.localResults = this.searchService.getResultsInCurrentFolder(
				term,
				LOCAL_RESULTS_LIMIT,
			);
			for (const result of this.localResults) {
				if (result instanceof RecordVO) {
					this.localResultsByRecordId.add(result.recordId);
				} else {
					this.localResultsByFolderId.add(result.folderId);
				}
			}
		}

		this.showResults = true;
	}

	updateTagsResults(term: string, selectedTags: TagVOData[]) {
		const termMatches = this.searchService.getTagResults(term);
		const selectedNames = selectedTags.map((t) => t.name);
		this.tagResults = termMatches.filter(
			(i) => !selectedNames.includes(i.name),
		);
	}

	onLocalResultClick(item: ItemVO) {
		this.data.showItem(item, true);
		this.onCoverClick();
	}

	onTagResultClick(tag: TagVOData) {
		const [, tags]: [string, TagVOData[]] = this.searchService.parseSearchTerm(
			this.formControl.value,
		);

		// replace any text query with existing tags + clicked tag
		tags.push(tag);
		const tagString = tags.map((t) => `tag:"${t.name}"`).join(' ') + ' ';
		this.formControl.setValue(tagString);
		if (this.tagResults) {
			remove(this.tagResults, tag);
		}

		(this.inputElementRef.nativeElement as HTMLInputElement).focus();
	}

	onGlobalResultClick(item: ItemVO) {
		if (item.parentFolder_linkId === this.data.currentFolder?.folder_linkId) {
			return this.onLocalResultClick(item);
		}

		const publicRoot = this.account.getPublicRoot();
		const privateRoot = this.account.getPrivateRoot();

		let routerPath: any[];

		if (item.folder_linkType === 'type.folder_link.public') {
			if (item.parentArchiveNbr === publicRoot.archiveNbr) {
				routerPath = ['/app', 'public'];
			} else {
				routerPath = [
					'/app',
					'public',
					item.parentArchiveNbr,
					item.parentFolder_linkId,
				];
			}
		} else if (item.folder_linkType === 'type.folder_link.private') {
			if (item.parentArchiveNbr === privateRoot.archiveNbr) {
				routerPath = ['/app', 'private'];
			} else {
				routerPath = [
					'/app',
					'private',
					item.parentArchiveNbr,
					item.parentFolder_linkId,
				];
			}
		}

		if (routerPath) {
			this.router.navigate(routerPath, {
				queryParams: { showItem: item.folder_linkId },
			});
		}

		this.onCoverClick();
	}

	onAllResultsClick() {
		this.router.navigate(['/app', 'search'], {
			queryParams: { query: this.formControl.value?.trim() },
		});
		this.onCoverClick();
	}
}
