import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription, firstValueFrom } from 'rxjs';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role';
import { ChecklistApi } from '../types/checklist-api';
import { ChecklistApiResponse, ChecklistItem } from '../types/checklist-item';

@Injectable({
  providedIn: 'root',
})
export class UserChecklistService implements ChecklistApi, OnDestroy {
  private recheckArchive = new Subject<void>();
  private accountSubscription: Subscription;

  constructor(
    private httpv2: HttpV2Service,
    private account: AccountService,
  ) {
    this.accountSubscription = account.archiveChange.subscribe(() => {
      this.recheckArchive.next();
    });
  }

  public ngOnDestroy(): void {
    this.accountSubscription.unsubscribe();
  }

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

  public isDefaultArchiveOwnedByAccount(): boolean {
    return (
      this.account.checkMinimumArchiveAccess(AccessRole.Owner) &&
      this.isDefaultArchive()
    );
  }

  public async setChecklistHidden(): Promise<void> {
    const updatedAccount = this.account.getAccount();
    updatedAccount.hideChecklist = true;
    await this.account.updateAccount(updatedAccount);
  }

  public getArchiveChangedEvent(): Subject<void> {
    return this.recheckArchive;
  }

  private isDefaultArchive(): boolean {
    return (
      this.account.getAccount().defaultArchiveId ===
      this.account.getArchive().archiveId
    );
  }
}
