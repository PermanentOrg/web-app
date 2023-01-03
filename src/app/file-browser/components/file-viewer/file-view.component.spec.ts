/* @format */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { Shallow } from 'shallow-render';

import { RecordVO, ItemVO, TagVOData, AccessRole } from '@root/app/models';
import { FileViewerComponent } from './file-viewer.component';
import { TagsComponent } from '../../../shared/components/tags/tags.component';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { FileBrowserComponentsModule } from '../../file-browser-components.module';

const defaultTagList: TagVOData[] = [
  {
    tagId: 1,
    name: 'tagOne',
    type: 'type.generic.placeholder',
  },
  {
    tagId: 2,
    name: 'tagTwo',
    type: 'type.generic.placeholder',
  },
  {
    tagId: 3,
    name: 'customField:customValueOne',
    type: 'type.tag.metadata.customField',
  },
  {
    tagId: 4,
    name: 'customField:customValueTwo',
    type: 'type.tag.metadata.customField',
  },
];
const defaultItem: ItemVO = new RecordVO({
  TagVOs: defaultTagList,
  type: 'document',
});

describe('FileViewerComponent', () => {
  let shallow: Shallow<FileViewerComponent>;
  async function defaultRender() {
    return await shallow.render(`<pr-file-viewer>`);
  }

  beforeEach(async(() => {
    shallow = new Shallow(FileViewerComponent, FileBrowserComponentsModule)
      .mock(Router, {
        navigate: (route: string[]) => Promise.resolve(true),
      })
      .mock(ActivatedRoute, {
        snapshot: {
          data: {
            singleFile: true,
            isPublicArchive: true,
            currentRecord: defaultItem,
          },
        },
      })
      .mock(DataService, {
        currentFolder: {
          ChildItemVOs: [],
        },
      })
      .mock(AccountService, {
        checkMinimumAccess: (itemAccessRole, minimumAccess) => true,
      })
      .mock(EditService, {});
  }));

  it('should create', async () => {
    const { element } = await defaultRender();
    expect(element).not.toBeNull();
  });

  it('should have two tags components', async () => {
    const { findComponent } = await defaultRender();
    expect(findComponent(TagsComponent)).toHaveFound(2);
  });

  it('should correctly distinguish between keywords and custom metadata', async () => {
    const { element } = await defaultRender();

    expect(
      element.componentInstance.keywords.find((tag) => tag.name === 'tagOne')
    ).toBeTruthy();
    expect(
      element.componentInstance.keywords.find((tag) => tag.name === 'tagTwo')
    ).toBeTruthy();
    expect(
      element.componentInstance.keywords.find(
        (tag) => tag.name === 'customField:customValueOne'
      )
    ).not.toBeTruthy();
    expect(
      element.componentInstance.keywords.find(
        (tag) => tag.name === 'customField:customValueTwo'
      )
    ).not.toBeTruthy();

    expect(
      element.componentInstance.customMetadata.find(
        (tag) => tag.name === 'tagOne'
      )
    ).not.toBeTruthy();
    expect(
      element.componentInstance.customMetadata.find(
        (tag) => tag.name === 'tagTwo'
      )
    ).not.toBeTruthy();
    expect(
      element.componentInstance.customMetadata.find(
        (tag) => tag.name === 'customField:customValueOne'
      )
    ).toBeTruthy();
    expect(
      element.componentInstance.customMetadata.find(
        (tag) => tag.name === 'customField:customValueTwo'
      )
    ).toBeTruthy();
  });
});
