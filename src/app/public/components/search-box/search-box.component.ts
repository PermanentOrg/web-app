import {
	Component,
	OnInit,
	EventEmitter,
	Output,
	ElementRef,
	ViewChild,
	AfterViewInit,
	HostBinding,
	Input,
} from '@angular/core';
import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { ApiService } from '@shared/services/api/api.service';
import {
	UntypedFormGroup,
	Validators,
	UntypedFormBuilder,
} from '@angular/forms';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
	ItemMatch,
	MilestoneMatch,
	PublicArchiveSearchResult,
} from '@public/types/public-archive-search';

// Stela rejects public archive searches shorter than this.
const MINIMUM_QUERY_LENGTH = 3;
const RESULTS_PAGE_SIZE = 10;

@Component({
	selector: 'pr-search-box',
	templateUrl: './search-box.component.html',
	styleUrls: ['./search-box.component.scss'],
	standalone: false,
})
export class SearchBoxComponent implements OnInit, AfterViewInit {
	@Input() isPublicGallery = false;
	public searchForm: UntypedFormGroup;
	@Input() hideBorder = false;
	@Input() displayIcon = false;

	public archiveResults: PublicArchiveSearchResult[] | null;

	public waiting = false;
	public showInput = false;
	public showResults = false;
	@HostBinding('class.search-box-active') public searchBoxActive = false;

	public activeResultIndex = -1;

	@ViewChild('searchInput', { static: true }) searchInputRef: ElementRef;
	@Output() searchBarFocusChange = new EventEmitter();

	constructor(
		private api: ApiService,
		private fb: UntypedFormBuilder,
		private router: Router,
	) {
		this.searchForm = this.fb.group({
			query: ['', [Validators.required]],
		});
	}

	ngOnInit() {
		this.searchForm.valueChanges
			.pipe(
				debounceTime(100),
				switchMap((value) => {
					const query = value.query?.trim();
					if (query && query.length >= MINIMUM_QUERY_LENGTH) {
						this.waiting = true;
						return this.api.search
							.publicArchivesObservable(query, RESULTS_PAGE_SIZE)
							.pipe(
								map((response) => response.items),
								catchError(() => of(null)),
							);
					} else {
						return of(null);
					}
				}),
			)
			.subscribe((results) => {
				this.waiting = false;
				this.archiveResults = results;
				this.activeResultIndex = -1;
				this.showResults = this.archiveResults !== null;
			});
	}

	ngAfterViewInit() {
		this.searchInputRef.nativeElement.addEventListener('keydown', (evt) =>
			this.onSearchInputKeydown(evt),
		);
	}

	archiveResultTrackByFn(index, result: PublicArchiveSearchResult) {
		return result.archive.id;
	}

	onSearchButtonClick() {
		this.searchBoxActive = true;
		window.requestAnimationFrame(() => {
			this.searchInputRef.nativeElement.focus();
		});
	}

	onCancelButtonClick() {
		this.searchBoxActive = false;
	}

	onSearchInputKeydown(event: KeyboardEvent) {
		const isArrow = event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW;
		if (
			isArrow &&
			!this.waiting &&
			this.archiveResults &&
			this.archiveResults.length
		) {
			const direction = event.keyCode === DOWN_ARROW ? 1 : -1;
			const newActiveResultIndex = this.activeResultIndex + direction;
			this.activeResultIndex = Math.min(
				Math.max(-1, newActiveResultIndex),
				this.archiveResults.length - 1,
			);
		} else if (event.keyCode === ENTER) {
			const activeResult = this.archiveResults?.[this.activeResultIndex];
			if (activeResult) {
				this.onArchiveClick(activeResult);
			}
		}
	}

	onClearText() {
		this.searchForm.reset();
		this.showResults = false;
	}

	onArchiveClick(result: PublicArchiveSearchResult) {
		this.navigateTo(['/p', 'archive', result.archive.archiveNumber]);
	}

	onMatchClick(
		result: PublicArchiveSearchResult,
		match: MilestoneMatch | ItemMatch,
	) {
		const archiveRoute = ['/p', 'archive', result.archive.archiveNumber];
		if (match.matchType === 'milestone') {
			this.navigateTo([...archiveRoute, 'profile']);
		} else if (match.item.itemType === 'record') {
			this.navigateTo([...archiveRoute, 'record', match.item.archiveNumber]);
		} else {
			this.navigateTo([
				...archiveRoute,
				match.item.archiveNumber,
				match.item.folderLinkId,
			]);
		}
	}

	private navigateTo(route: string[]) {
		this.router.navigate(route);
		this.showResults = false;
		this.searchForm.reset();
		this.searchBoxActive = false;
	}
}
