import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { FolderVO, FolderVOData } from '@root/app/models';
import { find } from 'lodash';

@Component({
  selector: 'pr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  public isNavigating: boolean;
  public uploadProgressVisible: boolean;

  private routerListener: Subscription;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private messageService: MessageService,
    private upload: UploadService,
    private folderPicker: FolderPickerService
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
    const account = this.accountService.getAccount();
    if (account.emailNeedsVerification() && account.phoneNeedsVerification()) {
      this.messageService.showMessage(
        'Your email and phone number need verification. Tap this message to verify.',
        'info',
        false,
        ['/auth/verify']
      );
    } else if (account.emailNeedsVerification()) {
      this.messageService.showMessage(
        'Your email needs verification. Tap this message to verify.',
        'info',
        false,
        ['/auth/verify']
      );
    } else if (account.phoneNeedsVerification()) {
      this.messageService.showMessage(
        'Your phone number needs verification. Tap this message to verify.',
        'info',
        false,
        ['/auth/verify']
      );
    }

    const rootFolder = this.accountService.getRootFolder();
    const myFiles = new FolderVO(find(rootFolder.ChildItemVOs, {type: 'type.folder.root.private'}) as FolderVOData);
    this.folderPicker.chooseFolder(myFiles)
      .then((chosenFolder: FolderVO) => {
        console.log('got folder', chosenFolder);
      });
  }

  ngOnDestroy() {

  }

}
