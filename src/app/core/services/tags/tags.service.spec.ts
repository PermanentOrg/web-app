/* @format */
import { TestBed } from '@angular/core/testing';
import { Shallow } from 'shallow-render';
import { Subscription } from 'rxjs';

import { TagsService } from './tags.service';
import { AccountService } from '@shared/services/account/account.service';
import { AppModule } from '../../../app.module';
import { ArchiveVO, RecordVO } from '@models';

describe('TagsService', () => {
  let shallow: Shallow<TagsService>;

  beforeEach(() => {
    shallow = new Shallow(TagsService, AppModule).mock(AccountService, {
      getArchive: () => new ArchiveVO({ archiveId: 1 }),
      archiveChange: {
        subscribe: (callback) => new Subscription(),
      },
    });
  });

  it('should be created', () => {
    const { instance } = shallow.createService();
    expect(instance).toBeTruthy();
  });

  it('should only cache tags from the current archive', () => {
    const { instance } = shallow.createService();
    const item = new RecordVO({
      TagVOs: [
        { tagId: 1, name: 'testOne', archiveId: 1 },
        { tagId: 2, name: 'testTwo', archiveId: 2 },
      ],
    });
    instance.checkTagsOnItem(item);

    expect(instance.getTags().length).toEqual(1);
  });
});
