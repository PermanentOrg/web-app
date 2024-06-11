/* @format */
import { AccessRoleType } from '@models/access-role';
import { ChecklistApi } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';

export class DummyChecklistApi implements ChecklistApi {
  public static error: boolean = false;
  public static items: ChecklistItem[] = [];
  public static accountHidden: boolean = false;
  public static archiveAccess: AccessRoleType = 'access.role.owner';

  public static reset(): void {
    this.items = [];
    this.error = false;
    this.accountHidden = false;
    this.archiveAccess = 'access.role.owner';
  }

  public async getChecklistItems(): Promise<ChecklistItem[]> {
    if (DummyChecklistApi.error) {
      throw new Error('Unit test forced error');
    }
    return DummyChecklistApi.items;
  }

  public isAccountHidingChecklist(): boolean {
    return DummyChecklistApi.accountHidden;
  }

  public isArchiveOwnedByAccount(): boolean {
    return DummyChecklistApi.archiveAccess === 'access.role.owner';
  }
}
