import {
	Component,
	OnInit,
	OnDestroy,
	ElementRef,
	Inject,
	HostListener,
	Optional,
	DOCUMENT,
} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { Key } from 'ts-key-enum';
import Hammer from 'hammerjs';
import { gsap } from 'gsap';
import { filter, findIndex } from 'lodash';
import { RecordVO, ItemVO, TagVOData, AccessRole } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { DataStatus } from '@models/data-status.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import type { KeysOfType } from '@shared/utilities/keysoftype';
import { Subscription } from 'rxjs';
import { SearchService } from '@search/services/search.service';
import { ZoomingImageViewerComponent } from '@shared/components/zooming-image-viewer/zooming-image-viewer.component';
import { FileFormat } from '@models/file-vo';
import { GetAccessFile } from '@models/get-access-file';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';
import { ApiService } from '@shared/services/api/api.service';
import { TagsService } from '../../../core/services/tags/tags.service';

@Component({
	selector: 'pr-file-viewer',
	templateUrl: './file-viewer.component.html',
	styleUrls: ['./file-viewer.component.scss'],
	providers: [SearchService],
	standalone: false,
})
export class FileViewerComponent implements OnInit, OnDestroy {
	// Record
	public currentRecord: RecordVO;
	public prevRecord: RecordVO;
	public nextRecord: RecordVO;
	public records: RecordVO[];
	public currentIndex: number;
	public isZoomableImage = false;
	public isVideo = false;
	public isAudio = false;
	public isDocument = false;
	public showThumbnail = true;
	public isPublicArchive: boolean = false;
	public allowDownloads: boolean = false;
	public keywords: TagVOData[];
	public customMetadata: TagVOData[];

	public documentUrl = null;

	public canEdit: boolean;

	// Swiping
	private touchElement: HTMLElement;
	private thumbElement: HTMLElement;
	private bodyScroll: number;
	private hammer: HammerManager;
	private disableSwipes: boolean;
	private fullscreen: boolean;
	private velocityThreshold = 0.2;
	private screenWidth: number;
	private offscreenThreshold: number;
	private loadingRecord = false;

	// UI
	public useMinimalView = false;
	public editingDate: boolean = false;
	private bodyScrollTop: number;
	private tagSubscription: Subscription;
	private isUnlistedShare = true;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private element: ElementRef,
		private dataService: DataService,
		@Inject(DOCUMENT) private document: any,
		public sanitizer: DomSanitizer,
		private accountService: AccountService,
		private editService: EditService,
		private tagsService: TagsService,
		@Optional() publicProfile: PublicProfileService,
		private shareLinksService: ShareLinksService,
		private api: ApiService,
	) {
		// store current scroll position in file list
		this.bodyScrollTop = window.scrollY;

		const resolvedRecord = route.snapshot.data.currentRecord;

		if (route.snapshot.data.singleFile) {
			this.currentRecord = resolvedRecord;
			this.records = [this.currentRecord];
			this.currentIndex = 0;
		} else {
			this.setRecordsToPreview(resolvedRecord);
		}

		if (route.snapshot.data?.isPublicArchive) {
			this.isPublicArchive = route.snapshot.data.isPublicArchive;
		}

		if (publicProfile) {
			publicProfile.archive$()?.subscribe((archive) => {
				this.allowDownloads = !!archive?.allowPublicDownload;
			});
		}

		this.tagSubscription = this.tagsService
			.getItemTags$()
			?.subscribe((tags) => {
				this.customMetadata = tags?.filter((tag) =>
					tag.type.includes('type.tag.metadata'),
				);
				this.keywords = tags?.filter(
					(tag) => !tag.type.includes('type.tag.metadata'),
				);
			});
	}

	async ngOnInit() {
		this.isUnlistedShare = await this.shareLinksService.isUnlistedShare();

		this.canEdit = this.isUnlistedShare
			? false
			: this.accountService.checkMinimumAccess(
					this.currentRecord.accessRole,
					AccessRole.Editor,
				) && !this.route.snapshot.data?.isPublicArchive;

		if (this.isUnlistedShare) {
			const response = await this.api.record.get(
				[this.currentRecord],
				this.shareLinksService.currentShareToken,
			);
			this.setRecordsToPreview(response.getRecordVO());
		}

		this.initRecord();

		// disable scrolling file list in background
		this.document.body.style.setProperty('overflow', 'hidden');

		// bind hammer events to thumbnail area
		this.touchElement =
			this.element.nativeElement.querySelector('.thumb-target');
		this.hammer = new Hammer(this.touchElement);
		this.hammer.on('pan', (evt: HammerInput) => {
			this.handlePanEvent(evt);
		});
		// this.hammer.on('tap', (evt: HammerInput) => {
		//   this.useMinimalView = !this.useMinimalView;
		// });

		this.screenWidth = this.touchElement.clientWidth;
		this.offscreenThreshold = this.screenWidth / 2;
	}

	ngOnDestroy() {
		// re-enable scrolling and return to initial scroll position
		this.document.body.style.setProperty('overflow', '');
		setTimeout(() => {
			window.scrollTo(0, this.bodyScrollTop);
		});
		this.tagSubscription.unsubscribe();
	}

	private async setRecordsToPreview(resolvedRecord: RecordVO) {
		const currentFolderChildren =
			this.dataService?.ephemeralFolder?.ChildItemVOs ||
			this.dataService.currentFolder.ChildItemVOs;

		this.records = filter(currentFolderChildren, 'isRecord') as RecordVO[];
		this.currentIndex = findIndex(this.records, {
			folder_linkId: resolvedRecord.folder_linkId,
		});
		this.currentRecord = this.records[this.currentIndex];
		if (resolvedRecord !== this.currentRecord) {
			this.currentRecord.update(resolvedRecord);
		}

		this.loadQueuedItems();
	}

	@HostListener('window:resize', [])
	onViewportResize(event) {
		this.screenWidth = this.touchElement.clientWidth;
		this.offscreenThreshold = this.screenWidth / 2;
	}

	// Keyboard
	@HostListener('document:keydown', ['$event'])
	onKeyDown(event) {
		if (!this.fullscreen) {
			switch (event.key) {
				case Key.ArrowLeft:
					this.incrementCurrentRecord(true);
					break;
				case Key.ArrowRight:
					this.incrementCurrentRecord();
					break;
			}
		}
	}

	initRecord() {
		this.isAudio = this.currentRecord.type.includes('audio');
		this.isVideo = this.currentRecord.type.includes('video');
		this.isZoomableImage =
			this.currentRecord.type.includes('image') &&
			this.currentRecord.FileVOs?.length &&
			typeof ZoomingImageViewerComponent.chooseFullSizeImage(
				this.currentRecord,
			) !== 'undefined';
		this.isDocument = this.currentRecord.FileVOs?.some(
			(obj) => obj.type.includes('pdf') || obj.type.includes('txt'),
		);
		this.documentUrl = this.getDocumentUrl();
		this.setCurrentTags();
	}

	toggleSwipe(value: boolean) {
		this.disableSwipes = value;
	}

	toggleFullscreen(value: boolean) {
		this.fullscreen = value;
	}

	getDocumentUrl() {
		if (!this.isDocument) {
			return false;
		}

		const original = this.currentRecord.FileVOs.find(
			(file) => file.format === FileFormat.Original,
		);
		const access = GetAccessFile(this.currentRecord);

		let url;

		if (original?.type.includes('pdf') || original?.type.includes('txt')) {
			url = original?.fileURL;
		} else if (access) {
			url = access?.fileURL;
		}

		if (!url) {
			return false;
		}
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}

	isQueued(indexToCheck: number) {
		return (
			indexToCheck >= this.currentIndex - 1 &&
			indexToCheck <= this.currentIndex + 1
		);
	}

	handlePanEvent(evt: HammerInput) {
		if (this.disableSwipes) {
			return;
		}

		const queuedThumbs = document.querySelectorAll('.thumb-wrapper.queue');

		const previous = evt.deltaX > 0;
		const next = evt.deltaX < 0;
		const canNavigate =
			(previous && this.records[this.currentIndex - 1]) ||
			(next && this.records[this.currentIndex + 1]);
		const fastEnough = Math.abs(evt.velocityX) > this.velocityThreshold;
		const farEnough = Math.abs(evt.deltaX) > this.offscreenThreshold;

		if (!evt.isFinal) {
			// follow pointer for panning
			gsap.set(queuedThumbs, {
				x: (index, target) => evt.deltaX + getOrder(target) * this.screenWidth,
			});
		} else if (!(fastEnough || farEnough) || !canNavigate) {
			// reset to center, not fast enough or far enough
			gsap.to(queuedThumbs, {
				duration: 0.5,
				x: (index, target) => getOrder(target) * this.screenWidth,
				ease: 'Power4.easeOut',
			} as any);
		} else {
			// send offscreen to left or right, depending on direction
			let offset = 1;
			if (evt.deltaX < 0) {
				offset = -1;
			}
			this.disableSwipes = true;
			gsap.to(queuedThumbs, {
				duration: 0.5,
				x: (index, target) => (getOrder(target) + offset) * this.screenWidth,
				ease: 'Power4.easeOut',
				onComplete: () => {
					this.incrementCurrentRecord(previous);
				},
			} as any);
		}

		function getOrder(elem: HTMLElement) {
			if (elem.classList.contains('prev')) {
				return -1;
			}
			if (elem.classList.contains('next')) {
				return 1;
			} else {
				return 0;
			}
		}
	}

	incrementCurrentRecord(previous = false) {
		if (this.loadingRecord) {
			return;
		}

		let targetIndex = this.currentIndex;
		if (previous) {
			targetIndex -= 1;
		} else {
			targetIndex += 1;
		}

		if (!this.records[targetIndex]) {
			return;
		}

		this.loadingRecord = true;

		// update current record and fetch surrounding items
		const targetRecord = this.records[targetIndex];

		this.currentIndex = targetIndex;
		this.currentRecord = targetRecord;

		this.initRecord();

		this.disableSwipes = false;
		this.loadQueuedItems();

		if (targetRecord.archiveNbr) {
			this.navigateToCurrentRecord();
		} else if (targetRecord.isFetching) {
			targetRecord.fetched.then(() => {
				this.navigateToCurrentRecord();
			});
		} else {
			this.dataService.fetchLeanItems([targetRecord]).then(() => {
				this.navigateToCurrentRecord();
			});
		}
	}

	navigateToCurrentRecord() {
		this.router.navigate(['../', this.currentRecord.archiveNbr], {
			relativeTo: this.route,
		});
		this.loadingRecord = false;
	}

	loadQueuedItems() {
		const surroundingCount = 5;
		const start = Math.max(this.currentIndex - surroundingCount, 0);
		const end = Math.min(
			this.currentIndex + surroundingCount + 1,
			this.records.length,
		);
		const itemsToFetch = this.records
			.slice(start, end)
			.filter((item: RecordVO) => item.dataStatus < DataStatus.Full);
		if (itemsToFetch.length) {
			this.dataService.fetchFullItems(itemsToFetch);
		}
	}

	close() {
		if (this.isUnlistedShare) {
			this.router.navigate([
				`/share/${this.shareLinksService.currentShareToken}`,
			]);
		} else {
			this.router.navigate(['.'], { relativeTo: this.route.parent });
		}
	}

	public async onFinishEditing(
		property: KeysOfType<ItemVO, string>,
		value: string,
	): Promise<void> {
		this.editService.saveItemVoProperty(
			this.currentRecord as ItemVO,
			property,
			value,
		);
	}

	public onLocationClick(): void {
		if (this.canEdit) {
			this.editService.openLocationDialog(this.currentRecord as ItemVO);
		}
	}

	public onTagsClick(type: string): void {
		if (this.canEdit) {
			this.editService.openTagsDialog(this.currentRecord as ItemVO, type);
		}
	}

	public onDateToggle(active: boolean): void {
		this.editingDate = active;
	}

	public onDownloadClick(): void {
		this.dataService.downloadFile(this.currentRecord);
	}

	private setCurrentTags(): void {
		this.keywords = this.currentRecord.TagVOs.filter(
			(tag) => !tag.type.includes('type.tag.metadata'),
		);
		this.customMetadata = this.currentRecord.TagVOs.filter((tag) =>
			tag.type.includes('type.tag.metadata'),
		);
	}
}
