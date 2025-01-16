import { fakeAsync, tick } from '@angular/core/testing';
import { ArchiveVO, FolderVO } from '@models';
import { ProfileItemVOData } from '@models/profile-item-vo';
import { first, skip, take } from 'rxjs/operators';
import { PublicProfileService } from './public-profile.service';

describe('PublicProfileService', () => {
  let service: PublicProfileService;

  beforeEach(() => {
    service = new PublicProfileService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit root changes', fakeAsync(() => {
    const rootFolder = new FolderVO({});
    const rootFolder2 = new FolderVO({});

    service.setPublicRoot(rootFolder);

    service
      .publicRoot$()
      .pipe(first())
      .subscribe((currentArchive) => {
        expect(currentArchive).toBe(rootFolder);
      });

    tick();

    service
      .publicRoot$()
      .pipe(skip(1), first())
      .subscribe((newArchive) => {
        expect(newArchive).not.toBe(rootFolder);
        expect(newArchive).toBe(rootFolder2);
      });

    service.setPublicRoot(rootFolder2);

    tick();
  }));

  it('should emit archive changes', fakeAsync(() => {
    const archive = new ArchiveVO({});
    const archive2 = new ArchiveVO({});

    service.setArchive(archive);

    service
      .archive$()
      .pipe(first())
      .subscribe((currentArchive) => {
        expect(currentArchive).toBe(archive);
      });

    tick();

    service
      .archive$()
      .pipe(skip(1), first())
      .subscribe((newArchive) => {
        expect(newArchive).not.toBe(archive);
        expect(newArchive).toBe(archive2);
      });

    service.setArchive(archive2);

    tick();
  }));

  it('should emit profile item changes with the proper dictionary format', fakeAsync(() => {
    service
      .profileItemsDictionary$()
      .pipe(first())
      .subscribe((currentItems) => {
        expect(currentItems).toEqual({});
      });

    tick();

    const profileItems: ProfileItemVOData[] = [
      {
        fieldNameUI: 'profile.basic',
        string1: 'My Name',
      },
      {
        fieldNameUI: 'profile.job',
        string1: 'Job 2',
        day1: '2000-01-01',
      },
      {
        fieldNameUI: 'profile.job',
        string2: 'Job1',
        day1: '1960-01-01',
      },
    ];

    service
      .profileItemsDictionary$()
      .pipe(skip(1), first())
      .subscribe((newItemDict) => {
        expect(newItemDict.basic.length).toBe(1);
        expect(newItemDict.job.length).toBe(2);
      });

    service.setProfileItems(profileItems);

    tick();
  }));
});
