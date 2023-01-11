import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';

import { TagVO } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';

@Component({
  selector: 'pr-metadata-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss'],
})
export class CategoryEditComponent implements OnInit {
  @Input() public category: string;
  @Input() public tags: TagVO[];
  @Input() public dismissEvent: Subject<number>;
  @Output() public refreshTags: EventEmitter<void> = new EventEmitter<void>();
  @Output() public deletedCategory: EventEmitter<string> =
    new EventEmitter<string>();

  constructor(
    private api: ApiService,
    private msg: MessageService,
    private prompt: PromptService
  ) {}

  ngOnInit(): void {}

  public async delete(): Promise<void> {
    const deleted = this.getMatchingMetadataTags();
    try {
      await this.prompt.confirm(
        'Delete',
        `Are you sure you want to delete the "${this.category}" field? (This will remove ${deleted.length} metadata values)`
      );
    } catch {
      return;
    }
    try {
      await this.api.tag.delete(deleted);
      this.deletedCategory.emit(this.category);
      this.refreshTags.emit();
    } catch {
      this.msg.showError(
        'There was an error deleting the field. Please try again.'
      );
      throw new Error(
        'There was an error deleting the field. Please try again.'
      );
    }
  }

  public async save(newCategory: string): Promise<void> {
    const updated = this.getMatchingMetadataTags().map(
      (tag) =>
        new TagVO({
          tagId: tag.tagId,
          name: [newCategory].concat(tag.name.split(':').slice(1)).join(':'),
        })
    );
    try {
      await this.api.tag.update(updated);
      this.refreshTags.emit();
    } catch {
      this.msg.showError(
        'There was an error saving the field. Please try again.'
      );
      throw new Error('There was an error saving the field. Please try again.');
    }
  }

  protected getMatchingMetadataTags(): TagVO[] {
    return this.tags.filter(
      (tag) =>
        tag.isCustomMetadata() && tag.name.split(':')[0] === this.category
    );
  }
}
