import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { find } from 'lodash';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { UploadService } from '@core/services/upload/upload.service';
import { FolderVO } from '@root/app/models';

@Component({
  selector: 'pr-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public files: File[] = [];

  constructor(private accountService: AccountService, private router: Router, private messageService: MessageService,
    private api: ApiService, private upload: UploadService
  ) { }

  ngOnInit() {
  }

  logOut() {
    this.accountService.logOut()
    .then(() => {
      this.messageService.showMessage(`Logged out successfully`, 'success');
      this.router.navigate(['/login']);
    });
  }
}
