import { Shallow } from 'shallow-render';
import { EditValueComponent } from './edit-value.component';
import { ManageMetadataModule } from '../manage-metadata.module';
import { MetadataValuePipe } from '../pipes/metadata-value.pipe';

import { TagVO, TagVOData } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import { FormsModule } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';

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

  it('should print tag value', async () => {
    const { find } = await defaultRender();
    expect(find('.value-name').nativeElement.innerText).toBe('123');
  });

  it('should have a dropdown edit/delete menu', async () => {
    const { find, fixture } = await defaultRender();
    expect(find('.edit-delete-menu').length).toBe(0);
    expect(find('.edit-delete-trigger').length).toBe(1);
    find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(find('.edit-delete-menu').length).toBe(1);
  });

  it('should be able to delete a tag', async () => {
    const { find, fixture, outputs } = await defaultRender();
    expect(find('.delete').length).toBe(0);
    find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(find('.delete').length).toBe(1);
    expect(outputs.refreshTags.emit).not.toHaveBeenCalled();
    find('.delete')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    await fixture.whenStable();
    expect(deleted).toBeTrue();
    expect(outputs.refreshTags.emit).toHaveBeenCalled();
  });

  it('should be able to open the value editor', async () => {
    const { instance, find, fixture } = await defaultRender();
    expect(find('.value-editor').length).toBe(0);
    expect(find('.edit').length).toBe(0);
    find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(find('.edit').length).toBe(1);
    find('.edit')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(find('.value-line').length).toBe(0);
    expect(find('.edit-delete-menu').length).toBe(0);
    expect(find('.value-editor').length).toBe(1);
    expect(find('.value-editor input').length).toBe(1);
    const input = find('.value-editor input');
    input.nativeElement.value = 'Test';
    input.triggerEventHandler('input', { target: input.nativeElement });
    expect(instance.newValueName).toBe('Test');
    expect(input.nativeElement.placeholder).toBe('123');
  });

  it('should be able to edit a value', async () => {
    const { instance, find, fixture, outputs } = await defaultRender();
    find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    find('.edit')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    const input = find('.value-editor input');
    expect(outputs.refreshTags.emit).not.toHaveBeenCalled();
    input.nativeElement.value = 'potato';
    input.triggerEventHandler('input', { target: input.nativeElement });
    find('form').triggerEventHandler('submit', {});
    await fixture.whenStable();
    fixture.detectChanges();
    expect(find('.value-editor').length).toBe(0);
    expect(updated).toBeTrue();
    expect(newTagName).toBe('abc:potato');
    expect(outputs.refreshTags.emit).toHaveBeenCalled();
  });

  it('should deal with errors while deleting', async () => {
    const { find, fixture } = await defaultRender();
    error = true;
    find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    find('.delete')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    await fixture.whenStable();
    expect(messageShown).toBeTrue();
    expect(find('.delete').length).toBe(1);
  });

  it('should not send multiple deletion api calls', async () => {
    const { find, fixture } = await defaultRender();
    find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    find('.delete')[0].triggerEventHandler('click', {});
    find('.delete')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    await fixture.whenStable();
    expect(apiCalls).toBe(1);
  });

  it('should deal with errors while editing', async () => {
    const { find, fixture } = await defaultRender();
    error = true;
    find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    find('.edit')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    find('form').triggerEventHandler('submit', {});
    await fixture.whenStable();
    fixture.detectChanges();
    expect(messageShown).toBeTrue();
    expect(find('form').length).toBe(1);
  });

  it('should not send multiple edit api calls', async () => {
    const { find, fixture } = await defaultRender();
    find('.edit-delete-trigger')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    find('.edit')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    find('form').triggerEventHandler('submit', {});
    find('form').triggerEventHandler('submit', {});
    await fixture.whenStable();
    fixture.detectChanges();
    expect(apiCalls).toBe(1);
  });
});
