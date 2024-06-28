/* @format */
import { AccessRoleType } from '@models/access-role';
import { Subject } from 'rxjs';
import { ChecklistApi } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';

export class DummyChecklistApi implements ChecklistApi {
  public static error: boolean = false;
  public static items: ChecklistItem[] = [];
  public static accountHidden: boolean = false;
  public static archiveAccess: AccessRoleType = 'access.role.owner';
  public static defaultArchive: boolean = true;
  public static savedAccount: boolean = false;

  private recheckArchive = new Subject<void>();
  private refreshChecklist = new Subject<void>();

  public static reset(): void {
    this.items = [];
    this.error = false;
    this.accountHidden = false;
    this.archiveAccess = 'access.role.owner';
    this.savedAccount = false;
  }

  public async getChecklistItems(): Promise<ChecklistItem[]> {
    if (DummyChecklistApi.error) {
      throw new Error('Unit test forced error');
    }
    return DummyChecklistApi.items;
  }

  public async setChecklistHidden(): Promise<void> {
    if (DummyChecklistApi.error) {
      throw new Error('Unit test forced error');
    }
    DummyChecklistApi.savedAccount = true;
  }

  public isAccountHidingChecklist(): boolean {
    return DummyChecklistApi.accountHidden;
  }

  public isDefaultArchiveOwnedByAccount(): boolean {
    return DummyChecklistApi.archiveAccess === 'access.role.owner';
  }

  public getArchiveChangedEvent(): Subject<void> {
    return this.recheckArchive;
  }

  public sendArchiveChangeEvent(): void {
    this.recheckArchive.next();
  }

  public getRefreshChecklistEvent(): Subject<void> {
    return this.refreshChecklist;
  }

  public sendRefreshEvent(): void {
    this.refreshChecklist.next();
  }
}
