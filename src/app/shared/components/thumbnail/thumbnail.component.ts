import { Component, Input, DoCheck, Inject, OnInit } from '@angular/core';

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

	public thumbLoaded = false;
	public isZip = false;
	public imageUrl: string | undefined;

	private lastItemFolderLinkId: number;

	private targetThumbWidth: number;
	private currentThumbUrl: string;

	private lastItemDataStatus: DataStatus;

	constructor(@Inject('Image') private ImageClass: typeof Image) {}

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
			this.item.dataStatus !== this.lastItemDataStatus
		);
	}

	public resetImage() {
		this.lastItemFolderLinkId = this.item.folder_linkId;
		this.lastItemDataStatus = this.item.dataStatus;
		this.isZip = this.item.type === 'type.record.archive';
		this.calculateAndSetImageBg();
	}

	public calculateAndSetImageBg() {
		const thumbInfo = GetThumbnailInfo(this.item);
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
