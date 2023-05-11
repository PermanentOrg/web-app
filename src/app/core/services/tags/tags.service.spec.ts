/* @format */
import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { TagsService } from './tags.service';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO, RecordVO } from '@models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from '@shared/services/api/api.service';

describe('TagsService', () => {
  let service: TagsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        {
          provide: AccountService,
          useValue: {
            getArchive: () => new ArchiveVO({ archiveId: 1 }),
            archiveChange: {
              subscribe: (callback) => new Subscription(),
            },
          },
        },
      ],
    });
    TestBed.inject(ApiService);
    service = TestBed.inject(TagsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should only cache tags from the current archive', () => {
    const item = new RecordVO({
      TagVOs: [
        { tagId: 1, name: 'testOne', archiveId: 1 },
        { tagId: 2, name: 'testTwo', archiveId: 2 },
      ],
    });
    service.checkTagsOnItem(item);

    expect(service.getTags().length).toEqual(1);
  });
});
