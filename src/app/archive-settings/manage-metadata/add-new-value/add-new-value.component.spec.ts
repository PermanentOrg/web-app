import { ComponentFixture, TestBed, tick } from '@angular/core/testing';

import { AddNewValueComponent } from './add-new-value.component';
import { Shallow } from 'shallow-render';
import { ManageMetadataModule } from '../manage-metadata.module';
import { FormsModule } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { TagVOData } from '@models/tag-vo';
import { CreationFormComponent } from '../creation-form/creation-form.component';

fdescribe('AddNewValueComponent', () => {
  let shallow: Shallow<AddNewValueComponent>;
  let category: string = 'test';
  let createdTag: TagVOData = null;
  let error: boolean = false;
  let messageShown: boolean = false;

  async function defaultRender(c: string = category) {
    return await shallow.render(
      '<pr-metadata-add-new-value [category]="category"></pr-metadata-add-new-value>',
      {
        bind: {
          category: c,
        },
      }
    );
  }

  beforeEach(async () => {
    category = 'test';
    createdTag = null;
    error = false;
    messageShown = false;
    shallow = new Shallow(AddNewValueComponent, ManageMetadataModule)
      .import(FormsModule)
      .dontMock(CreationFormComponent)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      })
      .mock(ApiService, {
        tag: {
          create: async (tag: TagVOData) => {
            if (error) {
              throw new Error('Test Error');
            }
            createdTag = tag;
          },
        },
      });
  });

  it('should create', async () => {
    const { element } = await defaultRender();
    expect(element).not.toBeNull();
  });

  it('should be able to create a new tag', async () => {
    const { instance, outputs } = await defaultRender();
    expect(outputs.tagsUpdate.emit).not.toHaveBeenCalled();
    await instance.createNewTag('abc');
    expect(createdTag?.name).toBe('test:abc');
    expect(outputs.tagsUpdate.emit).toHaveBeenCalled();
  });

  it('should show an error message when it errors out', async () => {
    const { instance, outputs } = await defaultRender();
    error = true;
    await expectAsync(instance.createNewTag('abc')).toBeRejected();
    expect(createdTag).toBeNull();
    expect(messageShown).toBeTrue();
    expect(outputs.tagsUpdate.emit).not.toHaveBeenCalled();
  });
});
