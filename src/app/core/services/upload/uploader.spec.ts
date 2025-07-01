import { EventService } from '@shared/services/event/event.service';
import { ApiService } from '@shared/services/api/api.service';
import { HttpClient } from '@angular/common/http';
import { FolderVO, RecordVO, SimpleVO } from '@models/index';
import { RecordResponse } from '@shared/services/api/record.repo';
import { Uploader } from './uploader';
import { UploadItem } from './uploadItem';

class MockApiService {
  public static gotPresigned: boolean = false;
  public static registeredRecord: RecordVO = null;
  public static registeredDestination: string = null;
  public static multipartRegistered: {
    record: RecordVO;
    uploadId: string;
    key: string;
    eTags: string[];
  } = null;
  public static reset() {
    MockApiService.gotPresigned = false;
    MockApiService.registeredRecord = null;
    MockApiService.registeredDestination = null;
    MockApiService.multipartRegistered = null;
  }
  public record = {
    async registerRecord(record: RecordVO, url: string) {
      MockApiService.registeredRecord = record;
      MockApiService.registeredDestination = url;
      return record;
    },
    async getPresignedUrl() {
      MockApiService.gotPresigned = true;
      return new RecordResponse({
        isSuccessful: true,
        Results: [
          {
            data: [
              {
                SimpleVO: new SimpleVO({
                  key: 'Result',
                  value: {
                    destinationUrl: 'testurl',
                    presignedPost: {
                      url: 'presignedTesturl',
                      fields: {
                        bucket: 'test',
                        'X-Amz-Algorithm': 'test',
                        'X-Amz-Credential': 'test',
                        'X-Amz-Date': 'test',
                        key: 'test',
                        Policy: 'test',
                        'X-Amz-Signature': 'test',
                      },
                    },
                  },
                }),
              },
            ],
          },
        ],
      });
    },

    async getMultipartUploadURLs(size: number) {
      const partSize = 10 * 1024 * 1024;
      const partCount = Math.ceil(size / partSize);
      return {
        urls: Array(partCount)
          .fill(null)
          .map((_, i) => `multipart-url-${i}`),
        uploadId: 'test-upload-id',
        key: 'test-file-key',
      };
    },
    async registerMultipartRecord(
      record: RecordVO,
      uploadId: string,
      key: string,
      eTags: string[],
    ) {
      MockApiService.multipartRegistered = { record, uploadId, key, eTags };
      return new RecordVO({
        displayName: 'multipart.txt',
        parentFolderId: record.parentFolderId,
      });
    },
  };
}

class MockHttpClient {
  public hitUrl: string = null;
  public formData: FormData = null;
  public post(url: string, formdata: FormData, options: any) {
    this.hitUrl = url;
    this.formData = formdata;
    return {
      forEach: async () => {},
    };
  }
}

describe('Uploader', () => {
  let uploader: Uploader;
  let api: MockApiService;
  let http: MockHttpClient;

  beforeEach(() => {
    MockApiService.reset();
    api = new MockApiService();
    http = new MockHttpClient();
    uploader = new Uploader(
      api as unknown as ApiService,
      http as unknown as HttpClient,
      new EventService(),
    );
  });

  it('can do a single-part upload', async () => {
    const uploadItem = new UploadItem(
      new File([], 'test.txt'),
      new FolderVO({ folderId: 1, folder_linkId: 1 }),
    );
    await uploader.uploadFile(uploadItem, () => {});

    expect(MockApiService.gotPresigned).toBeTrue();
    expect(http.hitUrl).toBe('presignedTesturl');
    expect(MockApiService.registeredRecord.displayName).toBe('test.txt');
    expect(MockApiService.registeredRecord.parentFolderId).toBe(1);
    expect(MockApiService.registeredDestination).toBe('testurl');
  });

  it('can do a multipart upload using MockApiService', async () => {
    const file = new File([new Uint8Array(200 * 1024 * 1024)], 'multipart.txt');
    const uploadItem = new UploadItem(
      file,
      new FolderVO({ folderId: 2, folder_linkId: 2 }),
    );

    const progressSpy = jasmine.createSpy();

    spyOn<any>(uploader, 'uploadToMultipartUrl').and.callFake(
      async (
        _url: string,
        _item: UploadItem,
        _pointer: number,
        eTags: string[],
      ) => {
        eTags.push('etag-mock');
      },
    );

    const result = await (uploader as any).uploadMultipart(
      uploadItem,
      progressSpy,
    );

    expect(MockApiService.multipartRegistered.record.parentFolderId).toBe(2);
    expect(MockApiService.multipartRegistered.eTags.length).toBe(20);
    expect(progressSpy).toHaveBeenCalled();
    expect(result.displayName).toBe('multipart.txt');
  });
});
