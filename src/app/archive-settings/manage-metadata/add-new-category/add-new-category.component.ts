import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TagVO } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import {
  PromptService,
  PromptField,
} from '@shared/services/prompt/prompt.service';

@Component({
  selector: 'pr-metadata-add-new-category',
  templateUrl: './add-new-category.component.html',
  styleUrls: ['./add-new-category.component.scss'],
})
export class AddNewCategoryComponent implements OnInit {
  @Output() public tagsUpdate = new EventEmitter<void>();
  constructor(
    private prompt: PromptService,
    private api: ApiService,
    private msg: MessageService
  ) {}

  ngOnInit(): void {}

  public async createNewCategory(categoryName: string) {
    const promptField: PromptField = {
      fieldName: 'valueName',
      placeholder: 'Value Name',
      initialValue: '',
      type: 'text',
    };
    let valueName: string;
    try {
      valueName = await this.prompt.prompt(
        [promptField],
        'Please create a default value to go into the new category'
      );
    } catch {
      // They canceled out of the prompt, return out of the error without throwing.
      return;
    }

    const newTag = new TagVO({
      name: `${categoryName}:${valueName}`,
    });
    try {
      await this.api.tag.create(newTag, {});
      this.tagsUpdate.emit();
    } catch (e) {
      this.msg.showError(
        'There was an error saving the new category. Please try again.'
      );
      throw e;
    }
  }
}
