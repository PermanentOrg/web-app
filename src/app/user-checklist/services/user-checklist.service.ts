import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { AccountService } from '@shared/services/account/account.service';
import { ChecklistApi } from '../types/checklist-api';
import { ChecklistItem } from '../types/checklist-item';

@Injectable({
  providedIn: 'root',
})
export class UserChecklistService implements ChecklistApi {
  constructor(
    private httpv2: HttpV2Service,
    private account: AccountService,
  ) {}

  public getChecklistItems(): Promise<ChecklistItem[]> {
    return firstValueFrom(
      this.httpv2.get<ChecklistItem>('/v2/event/checklist'),
    );
  }

  public isAccountHidingChecklist(): boolean {
    return this.account.getAccount()?.hideChecklist ?? true;
  }

  public isArchiveOwnedByAccount(): boolean {
    return false;
  }

  public async setChecklistHidden(): Promise<void> {}
}
