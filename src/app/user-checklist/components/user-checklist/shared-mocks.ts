/* @format */
import { AccountVO, AccountVOData } from '@models/account-vo';
import { ArchiveVO } from '@models/index';
import { ChecklistApi } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';

export class DummyChecklistApi implements ChecklistApi {
  public static error: boolean = false;
  public static items: ChecklistItem[] = [];

  public static reset(): void {
    this.items = [];
    this.error = false;
  }

  public async getChecklistItems(): Promise<ChecklistItem[]> {
    if (DummyChecklistApi.error) {
      throw new Error('Unit test forced error');
    }
    return DummyChecklistApi.items;
  }
}

export class DummyAccountService {
  public static accountVoData: Partial<AccountVOData> = {};

  public static reset(): void {
    this.accountVoData = {};
  }

  public getAccount(): AccountVO {
    return new AccountVO(DummyAccountService.accountVoData);
  }

  public getArchive(): ArchiveVO {
    return new ArchiveVO({});
  }
}
