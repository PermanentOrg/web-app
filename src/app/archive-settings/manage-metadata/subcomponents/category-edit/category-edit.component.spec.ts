import { Shallow } from 'shallow-render';
import { TagVO } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import {
  MessageService,
  MessageDisplayOptions,
} from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { FormEditComponent } from '../form-edit/form-edit.component';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { CategoryEditComponent } from './category-edit.component';

describe('CategoryEditComponent', () => {
  let shallow: Shallow<CategoryEditComponent>;
  let category: string;
  let tags: TagVO[];
  let deletedTags: TagVO[];
  let savedTags: TagVO[];
  let error: boolean;
  let messageShown: boolean;
  let rejectDelete: boolean;

  const defaultRender = async () =>
    await shallow.render(
      '<pr-metadata-category-edit [category]="category" [tags]="tags"></pr-metadata-category-edit>',
      {
        bind: {
          category,
          tags,
        },
      }
    );
  beforeEach(() => {
    category = 'test';
    tags = [
      new TagVO({
        tagId: 1,
        name: 'potato',
        type: 'type.tag.generic.placeholder',
      }),
      new TagVO({
        tagId: 2,
        name: 'test:abc',
        type: 'type.tag.metadata.customField',
      }),
      new TagVO({
        tagId: 3,
        name: 'test',
        type: 'type.tag.generic.placeholder',
      }),
      new TagVO({
        tagId: 4,
        name: 'test:test:123',
        type: 'type.tag.metadata.customField',
      }),
      new TagVO({
        tagId: 5,
        name: 'abc:123',
        type: 'type.tag.metadata.customField',
      }),
    ];
    deletedTags = [];
    savedTags = [];
    error = false;
    messageShown = false;
    rejectDelete = false;
    shallow = new Shallow(CategoryEditComponent, ManageMetadataModule)
      .dontMock(FormEditComponent)
      .mock(ApiService, {
        tag: {
          update: async (tag: TagVO[]) => {
            if (error) {
              throw new Error('Test Error');
            }
            savedTags = savedTags.concat(tag);
          },
          delete: async (tag: TagVO[]) => {
            if (error) {
              throw new Error('Test Error');
            }
            deletedTags = deletedTags.concat(tag);
          },
        },
      })
      .mock(MessageService, {
        showError: async (msg: MessageDisplayOptions) => {
          messageShown = true;
        },
      })
      .mock(PromptService, {
        confirm: async () => {
          if (rejectDelete) {
            throw new Error('Rejected delete');
          }
          return true;
        },
      });
  });

  it('should exist', async () => {
    const { element } = await defaultRender();

    expect(element).not.toBeNull();
  });

  it('should be able to delete a category', async () => {
    const { instance, outputs } = await defaultRender();
    await instance.delete();

    expect(deletedTags.length).toBe(2);
    deletedTags.forEach((tag) => expect(tag.name).toContain('test'));
    expect(outputs.refreshTags.emit).toHaveBeenCalled();
    expect(outputs.deletedCategory.emit).toHaveBeenCalledWith('test');
  });

  it('should deal with errors while deleting', async () => {
    const { instance, outputs } = await defaultRender();
    error = true;
    await expectAsync(instance.delete()).toBeRejected();

    expect(messageShown).toBeTrue();
    expect(outputs.refreshTags.emit).not.toHaveBeenCalled();
    expect(outputs.deletedCategory.emit).not.toHaveBeenCalled();
  });

  it('should be able to save a category', async () => {
    const { instance, outputs } = await defaultRender();
    await instance.save('potato');

    expect(savedTags.length).toBe(2);
    savedTags.forEach((tag) => {
      expect(tag.name.startsWith('potato')).toBeTrue(); // Verify category name changed
      expect(tag.name.substring(6).includes('potato')).toBeFalse(); // Verify value name not changed
    });

    expect(outputs.refreshTags.emit).toHaveBeenCalled();
  });

  it('should deal with errors while saving', async () => {
    const { instance, outputs } = await defaultRender();
    error = true;
    await expectAsync(instance.save('potato')).toBeRejected();

    expect(messageShown).toBeTrue();
    expect(outputs.refreshTags.emit).not.toHaveBeenCalled();
  });

  it('should not do anything if they cancel out of the deletion confirmation prompt', async () => {
    rejectDelete = true;
    const { instance, outputs } = await defaultRender();
    await instance.delete();

    expect(deletedTags.length).toBe(0);
    expect(outputs.deletedCategory.emit).not.toHaveBeenCalled();
  });
});
