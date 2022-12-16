import { Shallow } from 'shallow-render';
import { EditValueComponent } from './value-edit.component';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { MetadataValuePipe } from '../../pipes/metadata-value.pipe';

import { TagVO, TagVOData } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import { FormsModule } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { FormEditComponent } from '../form-edit/form-edit.component';

fdescribe('EditValueComponent', () => {
  let shallow: Shallow<EditValueComponent>;
  let deleted: boolean;
  let updated: boolean;
  let newTagName: string;
  let error: boolean;
  let messageShown: boolean;
  let apiCalls: number;

  const defaultRender = async (
    tag: TagVO = new TagVO({ tagId: 1, name: 'abc:123' })
  ) =>
    await shallow.render(
      '<pr-metadata-edit-value [tag]="tag"></pr-metadata-edit-value>',
      {
        bind: {
          tag,
        },
      }
    );

  beforeEach(() => {
    updated = false;
    deleted = false;
    newTagName = '';
    error = false;
    messageShown = false;
    apiCalls = 0;

    shallow = new Shallow(EditValueComponent, ManageMetadataModule)
      .import(FormsModule)
      .dontMock(FormEditComponent)
      .dontMock(MetadataValuePipe)
      .mock(ApiService, {
        tag: {
          delete: async (tag: TagVO) => {
            apiCalls++;
            if (error) {
              throw new Error('Test Error');
            }
            deleted = true;
          },
          update: async (tag: TagVO) => {
            apiCalls++;
            if (error) {
              throw new Error('Test Error');
            }
            updated = true;
            newTagName = tag.name;
          },
        },
      })
      .mock(MessageService, {
        showError: (message: string) => {
          messageShown = true;
        },
      });
  });

  it('should create', async () => {
    const { element } = await defaultRender();
    expect(element).toBeTruthy();
  });

  it('should be able to delete a tag', async () => {
    const { instance, outputs } = await defaultRender();
    await instance.delete();
    expect(deleted).toBeTrue();
    expect(outputs.refreshTags.emit).toHaveBeenCalled();
  });

  it('should be able to edit a value', async () => {
    const { instance, outputs } = await defaultRender();
    await instance.save('potato');
    expect(updated).toBeTrue();
    expect(newTagName).toBe('abc:potato');
    expect(outputs.refreshTags.emit).toHaveBeenCalled();
  });

  it('should deal with errors while deleting', async () => {
    const { instance, outputs } = await defaultRender();
    error = true;
    await expectAsync(instance.delete()).toBeRejected();
    expect(messageShown).toBeTrue();
    expect(outputs.refreshTags.emit).not.toHaveBeenCalled();
  });

  it('should deal with errors while editing', async () => {
    const { instance, outputs } = await defaultRender();
    error = true;
    await expectAsync(instance.save('test')).toBeRejected();
    expect(messageShown).toBeTrue();
    expect(outputs.refreshTags.emit).not.toHaveBeenCalled();
  });
});
