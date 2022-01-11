import { NgModule } from '@angular/core';
import { Shallow } from 'shallow-render';
import { ManageTagsComponent } from './manage-tags.component';

import { TagVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';

@NgModule({
  declarations: [], // components your module owns.
  imports: [], // other modules your module needs.
  providers: [ApiService], // providers available to your module.
  bootstrap: [] // bootstrap this root component.
})
class DummyModule {};

let throwError: boolean = false;
let deleted: boolean = false;
let deletedTag: TagVO;
let renamed: boolean = false;
let renamedTag: TagVO;
const mockApiService = {
  tag: {
    delete: async (data: any) => {
      if (throwError) {
        throw 'Test Error';
      }
      deleted = true;
      deletedTag = data as TagVO;
      return {
        getTagVOData: () => {
          return data;
        }
      };
    },
    update: async (data: any) => {
      if (throwError) {
        throw 'Test Error';
      }
      renamed = true;
      renamedTag = data as TagVO;
      return {
        getTagVOData: () => {
          return data;
        }
      };
    }
  }
}

describe('ManageTagsComponent #manage-tags', () => {
  let shallow: Shallow<ManageTagsComponent>;
  let defaultTags: TagVO[] = [];
  async function defaultRender(tags: TagVO[] = defaultTags) {
    return await shallow.render(`<pr-manage-tags [tags]="tags"></pr-manage-tags>`, {
      bind: {
        tags,
      }
    });
  }
  beforeEach(() => {
    throwError = false;
    deleted = false;
    renamed = false;
    deletedTag = null;
    renamedTag = null;
    defaultTags = [
      new TagVO({
        name: 'Tomato',
        tagId: 2,
      }),
      new TagVO({
        name: 'Potato',
        tagId: 1,
      }),
    ];
    shallow = new Shallow(ManageTagsComponent, DummyModule).mock(ApiService, mockApiService);
  });

  it('should exist', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });

  it('should have a sorted list of tags', async () => {
    const { find, element } = await defaultRender();
    expect(find('.tag').length).toBe(2);
    expect(find('.tag')[0].nativeElement.textContent).toContain('Potato');
  });

  it('should have a delete button for each tag', async () => {
    const { find, fixture, element, outputs } = await defaultRender();
    expect(find('.delete').length).toBeGreaterThan(0);
    expect(outputs.refreshTags.emit).not.toHaveBeenCalled();
    find('.delete')[0].nativeElement.click();
    await fixture.whenStable();
    expect(deleted).toBeTruthy();
    expect(deletedTag.name).toBe('Potato');
    expect(outputs.refreshTags.emit).toHaveBeenCalled();
    await fixture.detectChanges();
    expect(find('.tag').length).toBe(1);
  });

  it('should be able to rename tags', async () => {
    const { find, fixture, element, outputs } = await defaultRender();
    expect(find('.edit').length).toBeGreaterThan(0);
    find('.edit')[0].nativeElement.click();
    await fixture.detectChanges();
    expect(find('.tag input').length).toBe(1);
    expect(find('.tag input').nativeElement.value).toBe('Potato');
    find('.tag input').nativeElement.focus();
    find('.tag input').nativeElement.value = 'Starchy Tuber';
    find('.tag input').nativeElement.dispatchEvent(new Event('change'));
    find('.tag input').nativeElement.form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    await fixture.detectChanges();
    expect(find('.tag input').length).toBe(0);
    expect(renamed).toBeTruthy();
    expect(renamedTag.name).toBe('Starchy Tuber');
    expect(outputs.refreshTags.emit).toHaveBeenCalled();
  });

  it('can cancel out of renaming a tag', async () => {
    const { find, fixture } = await defaultRender();
    expect(find('.edit').length).toBeGreaterThan(0);
    find('.edit')[0].nativeElement.click();
    await fixture.detectChanges();
    expect(find('.cancel').length).toBe(1);
    find('.cancel').nativeElement.click();
    await fixture.detectChanges();
    expect(find('.cancel').length).toBe(0);
  });

  it('should be able to filter the tags list', async () => {
    const { find, fixture, element, outputs } = await defaultRender();
    expect(find('input.filter').length).toBe(1);
    find('input.filter').nativeElement.value = '  p ';
    find('input.filter').nativeElement.dispatchEvent(new Event('change'));
    await fixture.detectChanges();
    expect(find('.tag').length).toBe(1);
    find('input.filter').nativeElement.value = 'To';
    find('input.filter').nativeElement.dispatchEvent(new Event('change'));
    await fixture.detectChanges();
    expect(find('.tag').length).toBe(2);
    find('input.filter').nativeElement.value = 'ToM';
    find('input.filter').nativeElement.dispatchEvent(new Event('change'));
    await fixture.detectChanges();
    expect(find('.tag').length).toBe(1);
    find('input.filter').nativeElement.value = 'zzz';
    find('input.filter').nativeElement.dispatchEvent(new Event('change'));
    await fixture.detectChanges();
    expect(find('.tag').length).toBe(0);
  });

  it('should have a null state', async () => {
    const { find, fixture, element, outputs } = await defaultRender([]);
    expect(find('.tag').length).toBe(0);
    expect(find('.tagList').length).toBe(0);
  });
});
