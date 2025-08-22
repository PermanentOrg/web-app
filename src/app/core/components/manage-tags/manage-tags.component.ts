import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TagVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService } from '@shared/services/prompt/prompt.service';

@Component({
	selector: 'pr-manage-tags',
	templateUrl: './manage-tags.component.html',
	styleUrls: ['./manage-tags.component.scss'],
	standalone: false,
})
export class ManageTagsComponent {
	@Input() tags: TagVO[] = [];
	@Output() refreshTags = new EventEmitter<void>();

	public editingTagIds: number[] = [];
	public filter: string = '';
	public originalTags = new Map<number, string>();

	constructor(
		private api: ApiService,
		private prompt: PromptService,
	) {}

	public getFilteredTags(): TagVO[] {
		return this.tags
			.filter(
				(t) =>
					t.name
						.toLocaleLowerCase()
						.includes(this.filter.trim().toLocaleLowerCase()) &&
					!t.isCustomMetadata(),
			)
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	public getTagCount(): number {
		return this.tags.filter((t) => !t.isCustomMetadata()).length;
	}

	public onTagChange(tag: TagVO, newName: string): void {
		tag.name = newName;
	}

	public async saveTag(tag: TagVO): Promise<void> {
		await this.api.tag.update(tag);
		this.endEditingTag(tag);
		this.refreshTags.emit();
	}

	public async deleteTag(tag: TagVO): Promise<void> {
		return await this.prompt
			.confirm(
				'Delete',
				'Are you sure you want to delete this keyword from all items in the current archive?',
			)
			.then(async () => {
				this.tags = this.tags.filter((t) => t.tagId !== tag.tagId);
				return await this.api.tag
					.delete(tag)
					.then(() => {
						this.refreshTags.emit();
					})
					.catch(() => {
						// Let's add the tag back to UI to show it isn't deleted.
						this.tags.push(tag);
						throw new Error('Manage Keywords: Error accessing delete endpoint');
					});
			})
			.catch((e: Error) => {
				if (e) {
					throw new Error(e.message);
				}
			});
	}

	public isEditingTag(tag: TagVO): boolean {
		return this.editingTagIds.includes(tag.tagId);
	}

	public beginEditingTag(tag: TagVO): void {
		this.originalTags.set(tag.tagId, tag.name);
		this.editingTagIds.push(tag.tagId);
	}

	public endEditingTag(tag: TagVO, reset: boolean = false): void {
		this.editingTagIds = this.editingTagIds.filter((t) => t !== tag.tagId);
		if (reset) {
			if (this.originalTags.has(tag.tagId)) {
				tag.name = this.originalTags.get(tag.tagId);
				this.originalTags.delete(tag.tagId);
			}
		}
	}
}
