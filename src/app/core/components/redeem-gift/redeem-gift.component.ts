/* @format */
import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { PromoVOData } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import {
  BillingResponse,
  AccountResponse,
  ClaimingPromoResponse,
} from '@shared/services/api/index.repo';
import { FileSizePipe } from '@shared/pipes/filesize.pipe';
import { AccountService } from '@shared/services/account/account.service';
import { EventService } from '@shared/services/event/event.service';

interface StorageRedemptionMessage {
  successful: boolean;
  message: string;
}

@Component({
  selector: 'pr-redeem-gift',
  templateUrl: './redeem-gift.component.html',
  styleUrl: './redeem-gift.component.scss',
  standalone: false,
})
export class RedeemGiftComponent implements OnInit {
  @Input() public promoCode: string = '';
  public resultMessage: StorageRedemptionMessage | undefined;
  public promoForm: UntypedFormGroup;
  public waiting: boolean;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private account: AccountService,
    private api: ApiService,
    private event: EventService,
  ) {}

  public ngOnInit(): void {
    this.promoForm = this.formBuilder.group({
      code: [this.promoCode, [Validators.required]],
    });
  }

  public async onPromoFormSubmit(value: PromoVOData) {
    try {
      this.waiting = true;
      const response = await this.api.billing.redeemPromoCode(value);

      await this.handleValidPromoCode(response[0]);
    } catch (err: unknown) {
      this.showPromoCodeError(err);
    } finally {
      this.waiting = false;
    }
  }

  private showPromoCodeError(err: unknown) {
    const message =
      err instanceof BillingResponse || err instanceof AccountResponse
        ? err.getMessage()
        : 'There was an error redeeming your code.';
    this.resultMessage = { message, successful: false };
  }

  private async handleValidPromoCode(response: ClaimingPromoResponse) {
    await this.updateAccountStorageBytes(response);
    this.event.dispatch({
      entity: 'account',
      action: 'submit_promo',
    });
    this.promoForm.reset();
  }

  private async updateAccountStorageBytes(response) {
    const spaceBeforeRefresh = this.account.getAccount()?.spaceTotal;
    await this.account.refreshAccount();

    const spaceAfterRefresh = this.account.getAccount()?.spaceTotal;
    const promo = response;
    const bytes = promo.sizeInMB * (1024 * 1024);

    if (spaceBeforeRefresh == spaceAfterRefresh) {
      this.account.addStorageBytes(bytes);
    }

    this.showPromoCodeSuccess(bytes);
  }

  private showPromoCodeSuccess(bytes: number) {
    const pipe = new FileSizePipe();
    this.resultMessage = {
      message: `Gift code redeemed for ${pipe.transform(bytes)} of storage.`,
      successful: true,
    };
  }
}
