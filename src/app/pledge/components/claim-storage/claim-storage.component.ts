import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import APP_CONFIG from '@root/app/app.config';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { AccountResponse } from '@shared/services/api/index.repo';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

@Component({
  selector: 'pr-claim-storage',
  templateUrl: './claim-storage.component.html',
  styleUrls: ['./claim-storage.component.scss']
})
export class ClaimStorageComponent implements OnInit {
  public signupForm: FormGroup;

  public waiting: boolean;
  public storageAmount: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {
    const params = route.snapshot.queryParams;

    this.storageAmount = params.storageAmount;

    this.signupForm = fb.group({
      email: [params.email || '', [Validators.required, Validators.email]],
      name: [params.name || '', Validators.required],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      agreed: [false, [Validators.requiredTrue]],
      optIn: [true]
    });
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.signUp(
      formValue.email, formValue.name, formValue.password, formValue.confirm,
      formValue.agreed, formValue.optIn, null, formValue.invitation
    ).then((response: AccountResponse) => {
        const account = response.getAccountVO();
        if (account.needsVerification()) {
          // this.message.showMessage(`Verify to continue as ${account.primaryEmail}.`, 'warning');
          this.router.navigate(['/verify']);
        } else {
          this.accountService.logIn(formValue.email, formValue.password, true, true)
            .then(() => {
              // this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}.`, 'success');
              this.router.navigate(['/']);
            });
        }
      })
      .catch((response: AccountResponse) => {
        // this.message.showError(response.getMessage(), true);
        this.waiting = false;
      });
  }

}
