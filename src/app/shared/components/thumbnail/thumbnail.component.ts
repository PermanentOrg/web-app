import {
	Component,
	Input,
	ElementRef,
	HostListener,
	DoCheck,
	Inject,
	OnInit,
} from '@angular/core';

import { debounce } from 'lodash';
import { ItemVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { GetThumbnailInfo } from '@models/get-thumbnail';

@Component({
	selector: 'pr-thumbnail',
	templateUrl: './thumbnail.component.html',
	styleUrls: ['./thumbnail.component.scss'],
	standalone: false,
})
export class ThumbnailComponent implements OnInit, DoCheck {
	@Input() public item: ItemVO;
	@Input() public maxWidth: number | undefined;

	public thumbLoaded = false;
	public isZip = false;
	public imageUrl: string | undefined;

	private lastItemFolderLinkId: number;
	private lastMaxWidth: number;

	private element: Element;

	private targetThumbWidth: number;
	private currentThumbUrl: string;
	private dpiScale = 1;

	private lastItemDataStatus: DataStatus;

	private debouncedResize: () => void | undefined;

	constructor(
		elementRef: ElementRef,
		@Inject('Image') private ImageClass: typeof Image,
	) {
		this.element = elementRef.nativeElement;
		this.debouncedResize = debounce(this.calculateWidthsAndSetImageBg, 100);
		this.dpiScale = window?.devicePixelRatio > 1.75 ? 2 : 1;
	}

	public ngOnInit(): void {
		this.resetImage();
	}

	public ngDoCheck() {
		if (this.shouldResetImage()) {
			this.resetImage();
		}
	}

	private shouldResetImage(): boolean {
		return (
			this.item.folder_linkId !== this.lastItemFolderLinkId ||
			this.maxWidth !== this.lastMaxWidth ||
			this.item.dataStatus !== this.lastItemDataStatus
		);
	}

	public resetImage() {
		this.lastItemFolderLinkId = this.item.folder_linkId;
		this.lastMaxWidth = this.maxWidth;
		this.lastItemDataStatus = this.item.dataStatus;
		this.isZip = this.item.type === 'type.record.archive';
		this.calculateWidthsAndSetImageBg();
	}

	@HostListener('window:resize', [])
	public onViewportResize() {
		this.debouncedResize();
	}

	public calculateWidthsAndSetImageBg() {
		const elemSize = this.element.clientWidth * this.dpiScale;
		const checkSize = this.maxWidth
			? Math.min(this.maxWidth, elemSize)
			: elemSize;

		const thumbInfo = GetThumbnailInfo(this.item, checkSize);
		this.targetThumbWidth = thumbInfo?.size ?? 200;
		this.setImageBg(thumbInfo?.url);
	}

	public setImageBg(imageUrl?: string) {
		this.currentThumbUrl = imageUrl;

		if (imageUrl) {
			const imageLoader = new this.ImageClass();
			const targetFolderLinkId = this.item.folder_linkId;
			imageLoader.onload = () => {
				this.thumbLoaded = true;
				if (this.item.folder_linkId === targetFolderLinkId) {
					this.imageUrl = imageUrl;
				}
			};

			imageLoader.src = imageUrl;
		} else {
			this.thumbLoaded = false;
			this.imageUrl = null;
		}
	}

	public getCurrentThumbUrl(): string {
		return this.currentThumbUrl;
	}

	public getTargetThumbWidth(): number {
		return this.targetThumbWidth;
	}
}
