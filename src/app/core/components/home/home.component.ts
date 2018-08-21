import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { find } from 'lodash';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { UploadService } from '@core/services/upload/upload.service';
import { FolderVO } from '@root/app/models';
import { FormBuilder, Validators } from '@angular/forms';
import { PromptService } from '@core/services/prompt/prompt.service';

@Component({
  selector: 'pr-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public files: File[] = [];

  constructor(private accountService: AccountService, private router: Router, private messageService: MessageService,
    private api: ApiService, private upload: UploadService, private fb: FormBuilder, private prompt: PromptService
  ) { }

  ngOnInit() {
    const testForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      email2: ['', [Validators.required, Validators.email]]
    });

    const testFieldNames = [{
      name: 'email',
      placeholder: 'Email',
      config: {autocomplete: 'email', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'off'}
    },
    {
      name: 'email2',
      placeholder: 'Email 2',
      config: {autocomplete: 'email', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'off'}
    }
  ];

    this.prompt.prompt(testForm, testFieldNames)
      .then((value) => {
        console.log('done!', value);
      })
      .catch(() => {
        console.error('cancelled!');
      });
  }

  logOut() {
    this.accountService.logOut()
    .then(() => {
      this.messageService.showMessage(`Logged out successfully`, 'success');
      this.router.navigate(['/login']);
    });
  }
}
