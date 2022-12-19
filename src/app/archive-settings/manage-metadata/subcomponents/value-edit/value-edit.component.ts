import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TagVO } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { MetadataValuePipe } from '../../pipes/metadata-value.pipe';

@Component({
  selector: 'pr-metadata-edit-value[tag]',
  templateUrl: './value-edit.component.html',
  styleUrls: ['./value-edit.component.scss'],
})
export class EditValueComponent implements OnInit {
  @Input() public tag: TagVO;
  @Output() public refreshTags: EventEmitter<void> = new EventEmitter<void>();

  constructor(private api: ApiService, private msg: MessageService) {}

  ngOnInit(): void {}

  public async delete() {
    try {
      await this.api.tag.delete(this.tag);
      this.refreshTags.emit();
    } catch {
      this.msg.showError(
        'There was an error deleting the custom value. Please try again.'
      );
      throw new Error(
        'There was an error deleting the custom value. Please try again.'
      );
    }
  }

  public async save(newName: string) {
    const metadataCategory = this.tag.name.split(':').shift();
    const newTagVo = new TagVO({
      tagId: this.tag.tagId,
      name: `${metadataCategory}:${newName}`,
    });

    try {
      await this.api.tag.update(newTagVo);
      this.refreshTags.emit();
    } catch {
      this.msg.showError(
        'There was an error saving the custom value. Please try again.'
      );
      throw new Error(
        'There was an error saving the custom value. Please try again.'
      );
    }
  }
}
