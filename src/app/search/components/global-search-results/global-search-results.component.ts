import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	OnDestroy,
} from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, TagVOData, RecordVO, ItemVO } from '@models';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { SearchService } from '@search/services/search.service';
import { map, tap, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { SearchResponse } from '@shared/services/api/index.repo';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { remove } from 'lodash';
import { ngIfFadeInAnimation } from '@shared/animations';
import { TagsService } from '@core/services/tags/tags.service';
import {
	HasSubscriptions,
	unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';

@Component({
	selector: 'pr-global-search-results',
	templateUrl: './global-search-results.component.html',
	styleUrls: ['./global-search-results.component.scss'],
	animations: [ngIfFadeInAnimation],
	standalone: false,
})
export class GlobalSearchResultsComponent
	implements OnInit, OnDestroy, HasSubscriptions
{
	@ViewChild('searchInput') inputElementRef: ElementRef;
	public formControl: UntypedFormControl;

	waiting = false;
	showResults = false;

	tagResults: TagVOData[];
	itemResults: ItemVO[];
	folderResults: FolderVO[];
	recordResults: RecordVO[];

	subscriptions: Subscription[] = [];
	constructor(
		private data: DataService,
		private fb: UntypedFormBuilder,
		private searchService: SearchService,
		private router: Router,
		private account: AccountService,
		private route: ActivatedRoute,
		private tags: TagsService,
	) {
		this.data.setCurrentFolder(
			new FolderVO({
				displayName: 'Search',
				pathAsText: ['Search'],
				type: 'page',
			}),
		);

		this.formControl = this.fb.control('');

		this.initFormHandler();

		this.subscriptions.push(
			this.route.queryParamMap.subscribe((params) => {
				if (params.has('query')) {
					const newQuery = params.get('query')?.trim();
					if (newQuery !== this.formControl.value) {
						this.formControl.setValue(newQuery, { emitEvent: true });
					}
				}
			}),
		);
	}

	ngOnInit(): void {
		const initQuery = this.getQueryFromParams();

		if (initQuery) {
			setTimeout(() => {
				this.formControl.setValue(initQuery, { emitEvent: true });
			});
		}
	}

	ngOnDestroy(): void {
		unsubscribeAll(this.subscriptions);
	}

	getQueryFromParams() {
		const queryParams = this.route.snapshot.queryParamMap;

		if (queryParams.has('query')) {
			return queryParams.get('query').trim();
		} else {
			return null;
		}
	}

	setQueryParams(query: string) {
		const params: any = {};

		if (query) {
			params.query = query.trim();
		}

		if (params.query !== this.route.snapshot.queryParamMap.get('query')) {
			this.router.navigate([], {
				relativeTo: this.route,
				queryParams: params,
				queryParamsHandling: 'merge',
			});
		}
	}

	initFormHandler() {
		this.formControl.valueChanges
			.pipe(
				map((term) => this.searchService.parseSearchTerm(term)),
				tap(([term, tags]) => {
					this.showResults = true;
					this.updateTagsResults(term as string, tags);
				}),
				debounceTime(50),
				switchMap(([term, tags]) => {
					if (term?.length || tags?.length) {
						this.waiting = true;
						return this.searchService
							.getResultsInCurrentArchive(term, tags, 1000)
							.pipe(catchError((err) => of(err)));
					} else {
						return of(null);
					}
				}),
			)
			.subscribe(
				(response) => {
					this.waiting = false;
					if (response) {
						if (response instanceof SearchResponse && response.isSuccessful) {
							this.setQueryParams(this.formControl.value);
							const records: RecordVO[] = [];
							const folders: FolderVO[] = [];

							response.getItemVOs().forEach((i) => {
								if (i instanceof RecordVO) {
									records.push(i);
								} else {
									folders.push(i);
								}
							});

							this.itemResults = response.getItemVOs();
							this.recordResults = records;
							this.folderResults = folders;
						} else {
							this.itemResults = [];
							this.recordResults = [];
							this.folderResults = [];
						}
					} else {
						this.reset();
					}
				},
				(err) => {
					throw err;
				},
			);
	}

	resultTrackByFn(index, item: ItemVO) {
		return item.folder_linkId;
	}

	updateTagsResults(term: string, selectedTags: TagVOData[]) {
		const termMatches = this.searchService.getTagResults(term);
		const selectedNames = selectedTags.map((t) => t.name);
		this.tagResults = termMatches.filter(
			(i) => !selectedNames.includes(i.name),
		);
	}

	reset() {
		this.tagResults = null;
		this.itemResults = null;
		this.folderResults = null;
		this.recordResults = null;
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

	onItemResultClick(item: ItemVO) {
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
	}
}
