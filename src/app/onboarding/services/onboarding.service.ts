import { Injectable } from '@angular/core';
import { ArchiveVO } from '@models/index';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private onboardedArchives: ArchiveVO[] = [];

  constructor() {}

  public registerArchive(archive: ArchiveVO): void {
    this.onboardedArchives.push(archive);
  }

  public getFinalArchives(): ArchiveVO[] {
    return this.onboardedArchives;
  }
}
