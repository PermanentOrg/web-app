import {
	Component,
	OnInit,
	Input,
	OnDestroy,
	DoCheck,
	HostBinding,
	ElementRef,
	Optional,
	Inject,
} from '@angular/core';
import { TagsService } from '@core/services/tags/tags.service';
import { ItemVO, TagVOData, TagLinkVOData, FolderVO } from '@models';
import { DataService } from '@shared/services/data/data.service';
import { Subscription } from 'rxjs';
import {
	HasSubscriptions,
	unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { DataStatus } from '@models/data-status.enum';
import { ApiService } from '@shared/services/api/api.service';
import { BaseResponse } from '@shared/services/api/base';
import { MessageService } from '@shared/services/message/message.service';
import { ngIfScaleAnimation } from '@shared/animations';
import { SearchService } from '@search/services/search.service';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ArchiveSettingsDialogComponent } from '@core/components/archive-settings-dialog/archive-settings-dialog.component';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';

export type TagType = 'keyword' | 'customMetadata';

@Component({
	selector: 'pr-edit-tags',
	templateUrl: './edit-tags.component.html',
	styleUrls: ['./edit-tags.component.scss'],
	animations: [ngIfScaleAnimation],
	providers: [SearchService],
	standalone: false,
})
export class EditTagsComponent
	implements OnInit, DoCheck, OnDestroy, HasSubscriptions
{
	@Input() item: ItemVO;
	@Input() loading: boolean;
	@Input() tagType: TagType;

	@HostBinding('class.can-edit') @Input() canEdit: boolean;
	public allTags: TagVOData[];
	public matchingTags: TagVOData[];

	public itemTagsById: Set<number> = new Set();

	public itemTags: TagVOData[];

	public isEditing = false;

	public newTagInputError = false;

	@HostBinding('class.is-dialog') public isDialog = false;
	@HostBinding('class.is-waiting') public waiting = false;

	public newTagName: string;

	public placeholderText: string;

	public dialogTags: TagVOData[];

	subscriptions: Subscription[] = [];

	private lastDataStatus: DataStatus;
	private lastFolderLinkId: number;
	private dialogTagSubscription: Subscription;
	private currentIndex: number = 0;

	constructor(
		@Optional() @Inject(DIALOG_DATA) public dialogData: any,
		@Optional() private dialogRef: DialogRef,
		private searchService: SearchService,
		private tagsService: TagsService,
		private message: MessageService,
		private api: ApiService,
		private dataService: DataService,
		private elementRef: ElementRef,
		private dialog: DialogCdkService,
	) {
		this.subscriptions.push(
			this.tagsService.getTags$().subscribe((tags) => {
				if (this.allTags?.length > tags?.length) {
					// The user deleted one of our tags in manage-tags.
					// Let's close the editor.
					this.endEditing();
				}

				this.allTags = this.filterTagsByType(tags);
				this.matchingTags = this.filterTagsByType(tags);
				this.checkItemTags();
			}),
		);

		if (this.dialogData) {
			this.isDialog = true;
			this.canEdit = true;
			this.item = this.dialogData.item;
			this.tagType = this.dialogData.type;
			this.startEditing();
			this.dialogTagSubscription = this.tagsService
				.getItemTags$()
				.subscribe((tags) => {
					if (this.tagType === 'keyword') {
						this.dialogTags = tags?.filter(
							(tag) => !tag.type.includes('type.tag.metadata'),
						);
					} else {
						this.dialogTags = tags?.filter((tag) =>
							tag.type.includes('type.tag.metadata'),
						);
					}
				});
		}
	}

	ngOnInit() {
		this.placeholderText =
			this.tagType === 'keyword' ? 'Add new keyword' : 'Add new field:value';
		this.allTags = this.filterTagsByType(this.tagsService.getTags());
		this.matchingTags = this.allTags;

		this.checkItemTags();
		this.lastDataStatus = this.item?.dataStatus;
		this.lastFolderLinkId = this.item?.folder_linkId;
	}

	ngOnDestroy() {
		unsubscribeAll(this.subscriptions);
		this.dialogTagSubscription?.unsubscribe();
	}

	ngDoCheck() {
		if (this.item?.folder_linkId !== this.lastFolderLinkId) {
			this.endEditing();
			this.checkItemTags();
		} else if (this.item?.dataStatus !== this.lastDataStatus) {
			this.checkItemTags();
		}
	}

	async onInputEnter(newTagName: string) {
		if (!newTagName || !newTagName.length) {
			return;
		}

		if (!this.isNewTagInputValid(newTagName)) {
			this.newTagInputError = true;
			return;
		}

		const tag: TagVOData = { name: newTagName };
		await this.onTagClick(tag);
		this.newTagName = null;
		this.onTagType(this.newTagName);
	}

	async onTagClick(tag: TagVOData) {
		const tagLink: TagLinkVOData = {};
		if (this.item instanceof FolderVO) {
			tagLink.refTable = 'folder';
			tagLink.refId = this.item.folderId;
		} else {
			tagLink.refTable = 'record';
			tagLink.refId = this.item.recordId;
		}

		this.waiting = true;
		try {
			if (tag.tagId && this.itemTagsById.has(tag.tagId)) {
				await this.api.tag.deleteTagLink(tag, tagLink);
			} else {
				await this.api.tag.create(tag, tagLink);
			}
			await this.dataService.fetchFullItems([this.item]);
		} catch (err) {
			if (err instanceof BaseResponse) {
				this.message.showError({
					message: 'There was a problem saving keywords for this item.',
				});
			}
		} finally {
			this.checkItemTags();
			this.waiting = false;
			this.newTagName = null;
			this.onTagType(this.newTagName);
		}
	}

	onTagType(tag: string) {
		if (tag) {
			this.matchingTags = this.filterTagsByType(
				this.searchService.getTagResults(tag),
			);

			if (this.isNewTagInputValid(tag)) {
				this.newTagInputError = false;
			}
		} else {
			this.matchingTags = this.allTags;
		}
	}

	startEditing() {
		if (!this.canEdit) {
			return false;
		}

		this.checkItemTags();
		this.isEditing = true;
		(this.elementRef.nativeElement as HTMLElement).scrollIntoView({
			behavior: 'smooth',
		});
	}

	endEditing() {
		this.isEditing = false;
		this.newTagName = null;
		this.newTagInputError = false;
	}

	checkItemTags() {
		this.lastFolderLinkId = this.item?.folder_linkId;
		this.lastDataStatus = this.item?.dataStatus;

		this.itemTagsById.clear();

		this.itemTags = this.filterTagsByType(
			(this.item?.TagVOs || []).filter(
				// Filter out tags that are now null from deletion
				(tag) => tag?.name,
			),
		);

		if (!this.item?.TagVOs?.length) {
			return;
		}

		for (const tag of this.itemTags) {
			this.itemTagsById.add(tag.tagId);
		}
		this.tagsService.setItemTags(this.item.TagVOs);
	}

	onManageTagsClick() {
		this.dialog.open(ArchiveSettingsDialogComponent, { width: '1000px' });
	}

	filterTagsByType(tags: TagVOData[]): TagVOData[] {
		return tags.filter((tag) =>
			this.tagType === 'keyword'
				? !tag.type.includes('type.tag.metadata')
				: tag.type.includes('type.tag.metadata'),
		);
	}

	isNewTagInputValid(tagInput: string): boolean {
		if (this.tagType === 'keyword') {
			return /^[^:]*$/.test(tagInput);
		}
		return /^.+:.+$/.test(tagInput);
	}

	close() {
		this.dialogRef.close();
	}

	onArrowNav(event: KeyboardEvent, index: number) {
		event.stopPropagation();
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (index < this.matchingTags.length - 1) {
				this.currentIndex += 1;
				this.setFocusToCurrentIndex(index + 1);
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (index > 0) {
				this.setFocusToCurrentIndex(index - 1);
			} else if (index === 0) {
				this.setFocusToInputOrButton(`new-tag-${this.tagType}`);
			}
		}
	}

	public setFocusToInputOrButton(inputClass) {
		const input = this.elementRef.nativeElement.querySelector(`.${inputClass}`);
		(input as HTMLElement).focus();
	}

	public setFocusToFirstTagOrButton(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			this.setFocusToCurrentIndex(0);
		}
		if (event.key === 'ArrowRight') {
			event.stopPropagation();
			event.preventDefault();
			this.setFocusToInputOrButton(`add-tag-${this.tagType}`);
		}
		if (event.key === 'ArrowLeft') {
			event.stopPropagation();
			event.preventDefault();
			this.setFocusToInputOrButton(`new-tag-${this.tagType}`);
		}
	}

	public setFocusToCurrentIndex(index) {
		const elements = this.elementRef.nativeElement.querySelectorAll(
			`.edit-tag-${this.tagType}`,
		);
		(elements[index] as HTMLElement).focus();
	}
}
