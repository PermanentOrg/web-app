import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TagsService } from '@core/services/tags/tags.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-metadata-add-new-value',
  templateUrl: './add-new-value.component.html',
  styleUrls: ['./add-new-value.component.scss'],
})
export class AddNewValueComponent implements OnInit {
  @Input() public category: string;
  @Output() public tagsUpdate: EventEmitter<void> = new EventEmitter<void>();
  public editing: boolean = false;
  public newTagName: string = '';
  public waiting: boolean = false;

  constructor(private api: ApiService, private msg: MessageService) {}

  ngOnInit(): void {}

  public async createNewTag(tagName: string) {
    this.waiting = true;
    try {
      await this.api.tag.create(
        {
          name: this.category + ':' + tagName,
        },
        {}
      );
      this.editing = false;
      this.newTagName = '';
      this.tagsUpdate.emit();
    } catch {
      this.msg.showError(
        'There was an error creating the custom value. Please try again.'
      );
      throw new Error(
        'There was an error creating the custom value. Please try again.'
      );
    } finally {
      this.waiting = false;
    }
  }
}
