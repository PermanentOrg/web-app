import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { UploadService } from '@core/services/upload/upload.service';

@Component({
  selector: 'pr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  public isNavigating: boolean;
  public uploadProgressVisible: boolean;

  private routerListener: Subscription;

  constructor(private accountService: AccountService,
    private router: Router,
    private messageService: MessageService,
    private upload: UploadService
  ) {
    this.routerListener = this.router.events
      .pipe(filter((event) => {
        return event instanceof NavigationStart || event instanceof NavigationEnd;
      })).subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isNavigating = true;
        } else if (event instanceof NavigationEnd) {
          this.isNavigating = false;
        }
      });

    this.upload.progressVisible.subscribe((visible: boolean) => {
      this.uploadProgressVisible = visible;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {

  }

}
