import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role';
import { ChecklistApi } from '../types/checklist-api';
import { ChecklistApiResponse, ChecklistItem } from '../types/checklist-item';

@Injectable({
  providedIn: 'root',
})
export class UserChecklistService implements ChecklistApi {
  constructor(
    private httpv2: HttpV2Service,
    private account: AccountService,
  ) {}

  public async getChecklistItems(): Promise<ChecklistItem[]> {
    return (
      await firstValueFrom(
        this.httpv2.get<ChecklistApiResponse>('/v2/event/checklist'),
      )
    )[0].checklistItems;
  }

  public isAccountHidingChecklist(): boolean {
    return this.account.getAccount()?.hideChecklist ?? true;
  }

  public isArchiveOwnedByAccount(): boolean {
    return this.account.checkMinimumArchiveAccess(AccessRole.Owner);
  }

  public async setChecklistHidden(): Promise<void> {
    const updatedAccount = this.account.getAccount();
    updatedAccount.hideChecklist = true;
    await this.account.updateAccount(updatedAccount);
  }
}
