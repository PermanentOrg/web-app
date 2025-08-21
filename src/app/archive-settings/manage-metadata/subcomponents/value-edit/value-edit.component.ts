import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TagVO } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';

import { Subject } from 'rxjs';

@Component({
	selector: 'pr-metadata-edit-value[tag]',
	templateUrl: './value-edit.component.html',
	styleUrls: ['./value-edit.component.scss'],
	standalone: false,
})
export class EditValueComponent {
	@Input() public tag: TagVO;
	@Input() public dismissEvent: Subject<number>;

	@Output() public refreshTags: EventEmitter<void> = new EventEmitter<void>();
	@Output() public deletedTag: EventEmitter<TagVO> = new EventEmitter<TagVO>();

	constructor(
		private api: ApiService,
		private msg: MessageService,
		private prompt: PromptService,
	) {}

	public async delete() {
		try {
			await this.prompt.confirm(
				'Delete',
				`Are you sure you want to delete this metadata value? (${this.tag.name})`,
			);
		} catch {
			return;
		}

		try {
			await this.api.tag.delete(this.tag);
			this.deletedTag.emit(this.tag);
			this.refreshTags.emit();
		} catch {
			this.msg.showError({
				message:
					'There was an error deleting the custom value. Please try again.',
			});
			throw new Error(
				'There was an error deleting the custom value. Please try again.',
			);
		}
	}

	public async save(newName: string) {
		const metadataCategory = this.tag.name.split(':')[0];
		const newTagVo = new TagVO({
			tagId: this.tag.tagId,
			name: `${metadataCategory}:${newName}`,
		});

		try {
			await this.api.tag.update(newTagVo);
			this.refreshTags.emit();
		} catch {
			this.msg.showError({
				message:
					'There was an error saving the custom value. Please try again.',
			});
			throw new Error(
				'There was an error saving the custom value. Please try again.',
			);
		}
	}
}
