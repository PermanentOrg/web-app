import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TagVO } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { MetadataValuePipe } from '../pipes/metadata-value.pipe';

@Component({
  selector: 'pr-metadata-edit-value[tag]',
  templateUrl: './edit-value.component.html',
  styleUrls: ['./edit-value.component.scss'],
})
export class EditValueComponent implements OnInit {
  @Input() public tag: TagVO;
  @Output() public refreshTags: EventEmitter<void> = new EventEmitter<void>();
  public menuOpen = false;
  public editing = false;
  public waiting = false;
  public newValueName = '';
  public originalTagName = 'Tag Name';

  protected pipe: MetadataValuePipe = new MetadataValuePipe();

  constructor(private api: ApiService, private msg: MessageService) {}

  ngOnInit(): void {
    const tagName = this.pipe.transform(this.tag.name);
    this.newValueName = tagName;
    this.originalTagName = tagName;
  }

  public async delete() {
    if (!this.waiting) {
      this.waiting = true;
      try {
        await this.api.tag.delete(this.tag);
        this.menuOpen = false;
        this.refreshTags.emit();
      } catch {
        this.msg.showError(
          'There was an error deleting the custom value. Please try again.'
        );
      } finally {
        this.waiting = false;
      }
    }
  }

  public async saveTag() {
    if (!this.waiting) {
      this.waiting = true;
      const metadataCategory = this.tag.name.split(':').shift();
      const newTagVo = new TagVO({
        tagId: this.tag.tagId,
        name: `${metadataCategory}:${this.newValueName}`,
      });

      try {
        await this.api.tag.update(newTagVo);
        this.editing = false;
        this.refreshTags.emit();
      } catch {
        this.msg.showError(
          'There was an error saving the custom value. Please try again.'
        );
      } finally {
        this.waiting = false;
      }
    }
  }

  public openEditor(): void {
    this.editing = true;
    this.menuOpen = false;
  }
}
