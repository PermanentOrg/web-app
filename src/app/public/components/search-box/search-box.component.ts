/* @format */
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
import { ArchiveVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import {
	UntypedFormGroup,
	Validators,
	UntypedFormBuilder,
} from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { of } from 'rxjs';

const ANIMATION_DURATION = 1000;

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

	public archiveResults: ArchiveVO[];

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
					if (value.query && value.query.length > 3) {
						this.waiting = true;
						return this.api.search.archiveByNameObservable(value.query);
					} else {
						return of(null);
					}
				}),
			)
			.subscribe((response) => {
				this.waiting = false;
				if (response) {
					this.archiveResults = response.getArchiveVOs();
				} else {
					this.archiveResults = null;
				}
				this.activeResultIndex = -1;
				this.showResults = this.archiveResults !== null;
			});
	}

	ngAfterViewInit() {
		this.searchInputRef.nativeElement.addEventListener('keydown', (evt) =>
			this.onSearchInputKeydown(evt),
		);
	}

	archiveResultTrackByFn(index, archive: ArchiveVO) {
		return archive.archiveId;
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
			this.onArchiveClick(this.archiveResults[this.activeResultIndex]);
		}
	}

	onClearText() {
		this.searchForm.reset();
		this.showResults = false;
	}

	async onArchiveClick(archive: ArchiveVO) {
		this.router.navigate(['/p', 'archive', archive.archiveNbr]);
		this.showResults = false;
		this.searchForm.reset();
		this.searchBoxActive = false;
	}
}
