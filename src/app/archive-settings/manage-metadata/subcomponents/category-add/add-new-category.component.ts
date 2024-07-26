/*@format */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TagVO } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import {
  PromptService,
  PromptField,
} from '@shared/services/prompt/prompt.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'pr-metadata-add-new-category',
  templateUrl: './add-new-category.component.html',
  styleUrls: ['./add-new-category.component.scss'],
})
export class AddNewCategoryComponent {
  @Input() public dismissEvent: Subject<number>;
  @Output() public tagsUpdate = new EventEmitter<void>();
  @Output() public newCategory = new EventEmitter<string>();
  constructor(
    private prompt: PromptService,
    private api: ApiService,
    private msg: MessageService,
  ) {}

  public async createNewCategory(categoryName: string) {
    if (categoryName.includes(':')) {
      this.msg.showError({
        message:
          'A field name cannot contain the ":" character. Please use a different field name.',
      });
      throw new Error('Field name cannot contain ":"');
    }

    const promptField: PromptField = {
      fieldName: 'valueName',
      placeholder: 'Value Name',
      initialValue: '',
      type: 'text',
    };
    let valueName: string;
    try {
      ({ valueName } = await this.prompt.prompt(
        [promptField],
        'Please create a default value to go into the new field',
      ));
    } catch {
      // They canceled out of the prompt, return out of the error without throwing.
      return;
    }

    const newTag = new TagVO({
      name: `${categoryName}:${valueName}`,
    });
    try {
      await this.api.tag.create(newTag, {});
      this.newCategory.emit(categoryName);
      this.tagsUpdate.emit();
    } catch (e) {
      this.msg.showError({
        message: 'There was an error saving the new field. Please try again.',
      });
      throw e;
    }
  }
}
