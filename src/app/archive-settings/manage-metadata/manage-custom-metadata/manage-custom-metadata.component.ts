import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	Renderer2,
	ViewChild,
} from '@angular/core';
import { TagsService } from '@core/services/tags/tags.service';
import { TagVO } from '@models/tag-vo';
import { Subject } from 'rxjs';

@Component({
	selector: 'pr-manage-custom-metadata',
	templateUrl: './manage-custom-metadata.component.html',
	styleUrls: ['./manage-custom-metadata.component.scss'],
	standalone: false,
})
export class ManageCustomMetadataComponent implements OnInit, OnDestroy {
	@ViewChild('element') public element: ElementRef;
	public categories: string[] = [];
	public activeCategory: string | null = null;
	public values: TagVO[] = [];

	public dismissEvent = new Subject<number>();

	public tagsList: TagVO[] = [];
	protected tagMap: Map<string, TagVO[]> = new Map<string, TagVO[]>();

	protected deletedTagIds: number[] = [];

	protected windowListener: () => void;

	constructor(
		private renderer: Renderer2,
		private tag: TagsService,
	) {
		this.windowListener = this.renderer.listen(
			'window',
			'click',
			(e: Event) => {
				if (e.target && !this.element.nativeElement.contains(e.target)) {
					this.dismissEvent.next(-1);
				}
			},
		);
	}

	ngOnInit(): void {
		this.getTagsFromTagService();
		this.tagMap.clear();
		this.reloadTagMap();
	}

	ngOnDestroy(): void {
		if (this.windowListener) {
			this.windowListener();
		}
	}

	public setActiveCategory(category: string): void {
		if (!this.tagMap.has(category)) {
			this.activeCategory = null;
			this.values = [];
			return;
		}
		this.activeCategory = category;
		this.values = this.tagMap.get(category);
	}

	public async refreshTagsInPlace() {
		await this.tag.resetTags();
		this.getTagsFromTagService();
		this.tagMap.clear();
		this.reloadTagMap();
		this.setActiveCategory(this.activeCategory);
	}

	public identifyTag(_index: number, item: TagVO): number {
		return item.tagId;
	}

	public addDeletedTag(tag: TagVO): void {
		this.deletedTagIds.push(tag.tagId);
		const [category] = tag.name.split(':');
		if (this.tagMap.get(category).length === 1) {
			this.activeCategory = null;
		}
	}

	public addDeletedCategory(category: string): void {
		if (this.tagMap.has(category)) {
			for (const tag of this.tagMap.get(category)) {
				this.addDeletedTag(tag);
			}
		}

		if (this.activeCategory === category) {
			this.activeCategory = null;
		}
	}

	protected getTagsFromTagService() {
		this.tagsList = this.tag
			.getTags()
			.map((data) => new TagVO(data))
			.filter(
				(tag) =>
					tag.isCustomMetadata() && !this.deletedTagIds.includes(tag.tagId),
			);
	}

	protected addTagToTagMap(category: string, tag: TagVO): void {
		if (this.tagMap.has(category)) {
			if (tag) {
				this.tagMap.get(category).push(tag);
			}
		} else if (tag) {
			this.tagMap.set(category, [tag]);
		}
	}

	protected reloadTagMap(): void {
		for (const tag of this.tagsList) {
			if (tag.name.includes(':')) {
				const [category] = tag.name.split(':');
				this.addTagToTagMap(category, tag);
			}
		}
		this.categories = Array.from(this.tagMap.keys());
	}
}
