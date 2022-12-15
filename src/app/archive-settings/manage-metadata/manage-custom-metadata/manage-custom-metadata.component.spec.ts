import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCustomMetadataComponent } from './manage-custom-metadata.component';
import { Shallow } from 'shallow-render';
import { ManageMetadataModule } from '../manage-metadata.module';
import { ApiService } from '@shared/services/api/api.service';
import { Observable } from 'rxjs';
import { TagVO, TagVOData } from '@models/tag-vo';
import { TagsService } from '@core/services/tags/tags.service';
import { MetadataValuePipe } from '../pipes/metadata-value.pipe';

fdescribe('ManageCustomMetadataComponent #custom-metadata', () => {
  let shallow: Shallow<ManageCustomMetadataComponent>;
  let defaultTagList: TagVOData[] = [];

  beforeEach(async () => {
    defaultTagList = [
      {
        tagId: 1,
        name: 'basicTag',
        type: 'type.generic.placeholder',
      },
      {
        tagId: 2,
        name: 'a:1',
        type: 'type.tag.metadata.customField',
      },
      {
        tagId: 3,
        name: 'a:2',
        type: 'type.tag.metadata.customField',
      },
      {
        tagId: 4,
        name: 'a:3',
        type: 'type.tag.metadata.customField',
      },
      {
        tagId: 5,
        name: 'b:1',
        type: 'type.tag.metadata.customField',
      },
      {
        tagId: 6,
        name: 'c:1',
        type: 'type.tag.metadata.customField',
      },
    ];

    shallow = new Shallow(ManageCustomMetadataComponent, ManageMetadataModule)
      .dontMock(MetadataValuePipe)
      .mock(TagsService, {
        getTags: () => [...defaultTagList],
        getTags$: () => new Observable<TagVOData[]>(),
        refreshTags: async () => {},
      })
      .mock(ApiService, {
        tag: {
          update: async (tag: TagVO) => {},
          delete: async (tag: TagVO) => {},
        },
      });
  });

  it('should create', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });

  it('should load custom metadata categories', async () => {
    const { find } = await shallow.render();
    expect(find('.category').length).toBe(3);
  });

  it('should be able to select a category', async () => {
    const { find, fixture } = await shallow.render();
    expect(find('.category.selected').length).toBe(0);
    find('.category')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(find('.category.selected').length).toBe(1);
  });

  it('should be able to load tags by metadata category', async () => {
    const { find, fixture } = await shallow.render();
    expect(find('.value').length).toBe(0);
    find('.category')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(find('.value').length).toBe(3);
  });

  it('should be able to react to the add-new-value form', async () => {
    const { find, fixture } = await shallow.render();
    find('.category')[0].triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(find('.value').length).toBe(3);
    defaultTagList.push({
      tagId: 9,
      name: 'a:potato',
      type: 'type.tag.metadata.customField',
    });
    find('pr-metadata-add-new-value').triggerEventHandler('tagsUpdate', {});
    await fixture.whenStable();
    fixture.detectChanges();
    expect(find('.value').length).toBe(4);
  });
});
