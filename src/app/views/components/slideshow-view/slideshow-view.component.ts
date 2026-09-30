import {
	Component,
	OnInit,
	OnDestroy,
	HostListener,
	Inject,
	ViewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
	NgbCarousel,
	NgbSlideEvent,
	NgbSlideEventSource,
} from '@ng-bootstrap/ng-bootstrap';
import { Key } from 'ts-key-enum';
import { FolderVO, RecordVO } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { GetAccessFile } from '@models/get-access-file';
import { DataService } from '@shared/services/data/data.service';
import { getSlideshowRootUrl } from '@shared/utilities/slideshow';
import { getSlideshowImages } from './slideshow-util';

export const SLIDESHOW_INTERVAL_MS = 5000;
const PREFETCH_COUNT = 3;
const SLIDE_ID_PREFIX = 'slide-';

@Component({
	selector: 'pr-slideshow-view',
	templateUrl: './slideshow-view.component.html',
	styleUrls: ['./slideshow-view.component.scss'],
	standalone: false,
})
export class SlideshowViewComponent implements OnInit, OnDestroy {
	@ViewChild('carousel') carousel: NgbCarousel;

	public images: RecordVO[] = [];
	public currentIndex = 0;
	public hasViewableImage = true;

	private folder: FolderVO;
	private timer: ReturnType<typeof setTimeout>;
	private destroyed = false;
	// Incremented on every slide change so stale async work can be ignored
	private slideToken = 0;
	private loadedIndices = new Set<number>();
	// How many unavailable slides in a row have been skipped automatically
	private skipped = 0;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
		@Inject(DOCUMENT) private document: Document,
	) {}

	ngOnInit() {
		this.document.body.style.setProperty('overflow', 'hidden');
		this.folder = this.route.snapshot.data.currentFolder;
		this.images = getSlideshowImages(this.folder?.ChildItemVOs);
		if (this.images.length) {
			this.showSlide(0);
		}
	}

	ngOnDestroy() {
		this.destroyed = true;
		this.clearTimer();
		this.document.body.style.setProperty('overflow', '');
	}

	@HostListener('document:keydown', ['$event'])
	onKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case Key.Escape:
				this.exit();
				break;
			case Key.ArrowLeft:
				this.carousel?.prev(NgbSlideEventSource.ARROW_LEFT);
				break;
			case Key.ArrowRight:
				this.carousel?.next(NgbSlideEventSource.ARROW_RIGHT);
				break;
		}
	}

	public slideId(index: number) {
		return `${SLIDE_ID_PREFIX}${index}`;
	}

	// Only slides next to the current one get an image, so a large folder
	// doesn't download every full-size image at once
	public getSlideUrl(index: number): string | undefined {
		const length = this.images.length;
		const offset = (index - this.currentIndex + length) % length;
		const isNearby = offset <= 1 || offset === length - 1;
		return isNearby ? GetAccessFile(this.images[index])?.fileURL : undefined;
	}

	public onSlid(event: NgbSlideEvent) {
		const index = Number(event.current.slice(SLIDE_ID_PREFIX.length));
		const backwards = event.source === NgbSlideEventSource.ARROW_LEFT;
		this.showSlide(index, backwards);
	}

	public onImageLoad(index: number) {
		this.loadedIndices.add(index);
		if (index === this.currentIndex) {
			this.scheduleNext();
		}
	}

	public exit() {
		const rootUrl = getSlideshowRootUrl(this.router.url) ?? '/app/private';
		const { archiveNbr, folderLinkId } = this.route.snapshot.params;
		if (archiveNbr && folderLinkId) {
			this.router.navigate([rootUrl, archiveNbr, folderLinkId]);
		} else {
			this.router.navigate([rootUrl]);
		}
	}

	private async showSlide(index: number, backwards = false) {
		this.clearTimer();
		this.slideToken += 1;
		const token = this.slideToken;
		this.currentIndex = index;

		const record = this.images[index];
		this.prefetch(index);
		await this.ensureFetched(record);
		if (this.destroyed || token !== this.slideToken) {
			return;
		}

		if (!GetAccessFile(record)?.fileURL) {
			this.skipUnavailable(backwards);
			return;
		}

		this.skipped = 0;
		if (this.loadedIndices.has(index)) {
			this.scheduleNext();
		}
	}

	// Skip images that have no viewable file yet (e.g. still processing),
	// continuing in the direction the viewer was moving
	private skipUnavailable(backwards: boolean) {
		this.skipped += 1;
		if (this.skipped >= this.images.length) {
			this.hasViewableImage = false;
			return;
		}
		if (backwards) {
			this.carousel?.prev(NgbSlideEventSource.ARROW_LEFT);
		} else {
			this.carousel?.next(NgbSlideEventSource.TIMER);
		}
	}

	private scheduleNext() {
		this.clearTimer();
		if (this.images.length < 2) {
			return;
		}
		this.timer = setTimeout(() => {
			this.carousel?.next(NgbSlideEventSource.TIMER);
		}, SLIDESHOW_INTERVAL_MS);
	}

	private prefetch(index: number) {
		const length = this.images.length;
		const toFetch = new Set<RecordVO>();
		for (let offset = -1; offset <= PREFETCH_COUNT; offset += 1) {
			const record = this.images[(index + offset + length) % length];
			if (record.dataStatus < DataStatus.Full && !record.fetched) {
				toFetch.add(record);
			}
		}
		if (toFetch.size) {
			this.dataService.fetchFullItems(Array.from(toFetch));
		}
	}

	private async ensureFetched(record: RecordVO) {
		try {
			if (record.fetched) {
				await record.fetched;
			}
			// A pending lean fetch may have resolved without file data
			if (record.dataStatus < DataStatus.Full) {
				await this.dataService.fetchFullItems([record]);
			}
		} catch {
			// Treated the same as a record with no access file
		}
	}

	private clearTimer() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}
}
