/* @format */
import { AccountVO, AccountVOData } from '@models/account-vo';
import { ArchiveVO } from '@models/index';
import { ChecklistApi } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';

export class DummyChecklistApi implements ChecklistApi {
  public static error: boolean = false;
  public static items: ChecklistItem[] = [];
  public static accountHidden: boolean = false;

  public static reset(): void {
    this.items = [];
    this.error = false;
    this.accountHidden = false;
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
}
