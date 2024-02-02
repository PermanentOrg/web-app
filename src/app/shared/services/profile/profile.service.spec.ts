import { RecordVO } from './../../../models/record-vo';
/* @format */
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { ArchiveVO, FolderVO } from '@models/index';
import { SharedModule } from '@shared/shared.module';
import { Shallow } from 'shallow-render';
import { AccountService } from '../account/account.service';
import { ApiService } from '../api/api.service';
import { MessageService } from '../message/message.service';
import { PrConstantsService } from '../pr-constants/pr-constants.service';
import { ProfileService } from './profile.service';
import { ProfileItemVOData } from '@models/profile-item-vo';
import { ArchiveResponse } from '../api/archive.repo';

const PROFILE_TEMPLATE = require('../../../../../constants/profile_template.json');

const mockApiService = {
  archive: {
    update: (archive: ArchiveVO) => {
      return Promise.resolve(new ArchiveResponse({}));
    },
    getAllProfileItems: (archive: ArchiveVO) => {
      return Promise.resolve(new ArchiveResponse({}));
    },
    addUpdateProfileItems: (profileItems: ProfileItemVOData[]) => {
      return Promise.resolve(new ArchiveResponse({}));
    },
    deleteProfileItem: (profileItem: ProfileItemVOData) => {
      return Promise.resolve(new ArchiveResponse({}));
    },
  },
};
const mockConstantsService = {
  getProfileTemplate: () => {
    return PROFILE_TEMPLATE;
  },
};
const mockAccountService = {
  getArchive: () => {
    return new ArchiveVO({ archiveId: 1, type: 'archive.type.organization' });
  },
};
const mockFolderPickerService = {
  hooseRecord: (startingFolder: FolderVO) => {
    return Promise.resolve(new RecordVO({}));
  },
};

describe('ProfileService', () => {
  let shallow: Shallow<ProfileService>;
  let messageShown = false;

  beforeEach(() => {
    shallow = new Shallow(ProfileService, SharedModule)
      .mock(MessageService, {
        showError: () => {
          messageShown = true;
        },
      })
      .provideMock({ provide: ApiService, useValue: mockApiService })
      .provideMock({
        provide: PrConstantsService,
        useValue: mockConstantsService,
      })
      .provideMock({ provide: AccountService, useValue: mockAccountService })
      .provideMock({
        provide: FolderPickerService,
        useValue: mockFolderPickerService,
      })
      .dontMock(ProfileService);
  });

  it('should exist', async () => {
    const { instance } = await shallow.createService();

    expect(instance).toBeTruthy();
  });

  it('should return the correct completion value', async () => {
    const mockDictionary = {
      birth_info: [
        {
          day1: '2023-11-10',
          locnId1: null,
        },
      ],
      description: [
        {
          textData1:
            'Description descripoton Description descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDes',
        },
      ],
      email: [
        {
          string1: 'email@example',
        },
      ],
      social_media: [
        {
          string1: 'testSocialMedia',
        },
      ],
      basic: [
        {
          string1: 'Archive',
        },
      ],
      blurb: [
        {
          string1: 'BlurbTest',
        },
      ],
      established_info: [
        {
          day1: '2023-07-11',
        },
      ],
      milestone: [
        {
          string1: 'Milestone',
          day1: '2024-02-01',
          locnId1: null,
        },
      ],
    };
    const { instance } = await shallow.createService();
    (instance as any).profileItemDictionary = mockDictionary;

    const progress = instance.calculateProfileProgress();
    expect(progress).toBe(0.8);
  });

  it('should return the correct completion value', async () => {
    const mockDictionary = {
      birth_info: [
        {
          day1: '2023-11-10',
          locnId1: 'loc',
        },
      ],
      description: [
        {
          textData1:
            'Description descripoton Description descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDescription descripotonDes',
        },
      ],
      email: [
        {
          string1: 'email@example',
        },
      ],
      social_media: [
        {
          string1: 'testSocialMedia',
        },
      ],
      basic: [
        {
          string1: 'Archive',
        },
      ],
      blurb: [
        {
          string1: 'BlurbTest',
        },
      ],
      established_info: [
        {
          day1: '2023-07-11',
          locnId1: 'loc',
        },
      ],
      milestone: [
        {
          string1: 'Milestone',
          day1: '2024-02-01',
          locnId1: 'loc',
        },
      ],
    };
    const { instance } = await shallow.createService();
    (instance as any).profileItemDictionary = mockDictionary;

    const progress = instance.calculateProfileProgress();
    expect(progress).toBe(1);
  });

  it('should return the correct completion value', async () => {
    const mockDictionary = {};
    const { instance } = await shallow.createService();
    (instance as any).profileItemDictionary = mockDictionary;

    const progress = instance.calculateProfileProgress();
    expect(progress).toBe(0);
  });
});
