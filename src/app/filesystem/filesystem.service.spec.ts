/* @format */
import { TestBed } from '@angular/core/testing';
import { FolderVO } from '@models/index';
import { FilesystemService } from './filesystem.service';
import { FilesystemApiService } from './filesystem-api.service';

describe('FilesystemService', () => {
  let service: FilesystemService;
  let fetchedFolder: boolean;

  beforeEach(() => {
    fetchedFolder = false;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FilesystemApiService,
          useValue: {
            async navigate() {
              fetchedFolder = true;
              return new FolderVO({});
            },
          },
        },
      ],
    });
    service = TestBed.inject(FilesystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get a folder through the API', async () => {
    await service.getFolder({ folderId: 1 });

    expect(fetchedFolder).toBeTrue();
  });
});
