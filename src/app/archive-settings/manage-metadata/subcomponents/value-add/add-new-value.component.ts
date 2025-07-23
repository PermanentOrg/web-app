/* @format */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'pr-metadata-add-new-value',
  templateUrl: './add-new-value.component.html',
  styleUrls: ['./add-new-value.component.scss'],
  standalone: false,
})
export class AddNewValueComponent {
  @Input() public dismissEvent: Subject<number>;
  @Input() public category: string;
  @Output() public tagsUpdate: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private api: ApiService,
    private msg: MessageService,
  ) {}

  public async createNewTag(tagName: string) {
    try {
      await this.api.tag.create(
        {
          name: this.category + ':' + tagName,
        },
        {},
      );
      this.tagsUpdate.emit();
    } catch {
      this.msg.showError({
        message:
          'There was an error creating the custom value. Please try again.',
      });
      throw new Error(
        'There was an error creating the custom value. Please try again.',
      );
    }
  }
}
