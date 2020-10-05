import { Injectable } from '@angular/core';
import { ArchiveVO, FolderVO } from '@models';
import { ProfileItemVODictionary, ProfileItemVOData } from '@models/profile-item-vo';
import { addProfileItemToDictionary, orderItemsInDictionary } from '@shared/services/profile/profile.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PublicProfileService {
  publicRootBs = new BehaviorSubject<FolderVO>(null);
  archiveBs = new BehaviorSubject<ArchiveVO>(null);
  profileItemsDictionaryBs = new BehaviorSubject<ProfileItemVODictionary>({});

  constructor() { }

  publicRoot$() {
    return this.publicRootBs.asObservable();
  }

  archive$() {
    return this.archiveBs.asObservable();
  }

  profileItemsDictionary$() {
    return this.profileItemsDictionaryBs.asObservable();
  }

  setPublicRoot(folder: FolderVO) {
    this.publicRootBs.next(folder);
  }

  setArchive(archive: ArchiveVO) {
    this.archiveBs.next(archive);
  }

  setProfileItems(profileItems: ProfileItemVOData[]) {
    const dictionary: ProfileItemVODictionary = {};
    for (const profileItem of profileItems) {
      addProfileItemToDictionary(dictionary, profileItem);
    }

    orderItemsInDictionary(dictionary, 'milestone');

    this.profileItemsDictionaryBs.next(dictionary);
  }
}
