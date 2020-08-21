import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener, Optional } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService, PromptField } from '@shared/services/prompt/prompt.service';
import { FolderVO, RecordVO, AccountVO } from '@root/app/models';
import { find } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { Deferred } from '@root/vendor/deferred';
import { FolderResponse } from '@shared/services/api/index.repo';
import { Validators } from '@angular/forms';
import { DataService } from '@shared/services/data/data.service';
import { UploadSessionStatus } from '@core/services/upload/uploader';
import { Dialog } from '@root/app/dialog/dialog.module';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { DraggableComponent, DragTargetDroppableComponent, DragService, DragServiceStartEndEvent, DragServiceEvent } from '@shared/services/drag/drag.service';
import { PortalOutlet, CdkPortalOutlet } from '@angular/cdk/portal';
import { RouteHistoryService } from 'ngx-route-history';

@Component({
  selector: 'pr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy, DraggableComponent, DragTargetDroppableComponent {
  public isNavigating: boolean;
  public uploadProgressVisible: boolean;

  public isDraggingFile: boolean;
  public isDragTarget: boolean;

  private routerListener: Subscription;
  @ViewChild('mainContent') mainContentElement: ElementRef;
  @ViewChild(CdkPortalOutlet) portalOutlet: PortalOutlet;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private messageService: MessageService,
    private upload: UploadService,
    private route: ActivatedRoute,
    private prompt: PromptService,
    @Optional() private routeHistory: RouteHistoryService,
    private api: ApiService,
    private dialog: Dialog,
    private ga: GoogleAnalyticsService,
    @Optional() private drag: DragService,
    private data: DataService
  ) {
    this.routerListener = this.router.events
      .pipe(filter((event) => {
        return event instanceof NavigationStart || event instanceof NavigationEnd;
      })).subscribe((event) => {
        if (event instanceof NavigationStart) {
          const fromHasDialog = this.routeHistory?.currentRoute.includes('(');
          const toHasDialog = event.url.includes('(');
          if (!(fromHasDialog || toHasDialog)) {
            this.isNavigating = true;
          }
        } else if (event instanceof NavigationEnd) {
          this.isNavigating = false;
        }
      });

    this.upload.progressVisible.subscribe((visible: boolean) => {
      this.uploadProgressVisible = visible;
    });
  }

  async ngOnInit() {
    const account = this.accountService.getAccount();
    if (account.emailNeedsVerification() && account.phoneNeedsVerification()) {
      this.messageService.showMessage(
        'Your email and phone number need verification. Tap this message to verify.',
        'info',
        false,
        ['/auth/verify'],
        {
          sendEmail: true,
          sendSms: true
        }
      );
    } else if (account.emailNeedsVerification()) {
      this.messageService.showMessage(
        'Your email needs verification. Tap this message to verify.',
        'info',
        false,
        ['/auth/verify'],
        {
          sendEmail: true
        }
      );
    } else if (account.phoneNeedsVerification()) {
      this.messageService.showMessage(
        'Your phone number needs verification. Tap this message to verify.',
        'info',
        false,
        ['/auth/verify'],
        {
          sendSms: true
        }
      );
    }
    this.checkCta();

  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    this.checkShareByUrl();
  }

  async checkCta() {
    const cta = this.route.snapshot.queryParams.cta;

    switch (cta) {
      case 'timeline':
        this.startTimelineOnboarding();
        break;
    }
  }

  async startTimelineOnboarding() {
    try {
      const firstScreenTemplate = `
      <p>A Permanent timeline is the best way for others to experience your story as it unfolded in time.</p>
      <p>In just two steps, you will create a public, interactive timeline that anyone can find and see online using an easy-to-share link.</p>
      `;

      await this.prompt.confirm('Get started', 'Create your new timeline', null, null, firstScreenTemplate);

      const secondScreenTemplate = `
      <p>Give your timeline a name and an optional description so viewers can better understand what they see.</p>
      `;

      const secondScreenFields: PromptField[] = [
        {
          fieldName: 'displayName',
          placeholder: 'Name',
          validators: [ Validators.required ],
          config: {
            autocorrect: 'on',
            spellcheck: 'on'
          }
        },
        {
          fieldName: 'description',
          placeholder: 'Description (optional)',
          config: {
            autocorrect: 'on',
            spellcheck: 'on'
          }
        }
      ];

      const folderCreate = new Deferred();

      const promptData: any = await this.prompt.prompt(
        secondScreenFields, 'Name your new timeline', folderCreate.promise, 'Continue', null, secondScreenTemplate
      );

      const publicRoot = find(this.accountService.getRootFolder().ChildItemVOs, { type: 'type.folder.root.public'}) as FolderVO;
      const folder = new FolderVO({
        displayName: promptData.displayName,
        description: promptData.description,
        view: 'folder.view.timeline',
        sort: 'sort.display_date_asc',
        parentFolder_linkId: publicRoot.folder_linkId
      });
      const response = await this.api.folder.post([folder]);

      this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.initiated.params);
      const newFolder = response.getFolderVO();
      folderCreate.resolve();
      await this.router.navigate(['/public', newFolder.archiveNbr, newFolder.folder_linkId]);

      this.upload.promptForFiles();
      const uploadListener = this.upload.uploader.uploadSessionStatus.subscribe(async (status: UploadSessionStatus) => {
        if (status === UploadSessionStatus.Done) {
          try {
            await this.dialog.open('TimelineCompleteDialogComponent', { folder: newFolder }, { height: 'auto' });
          } catch (err) { }
          uploadListener.unsubscribe();
        } else if (status > UploadSessionStatus.Done) {
          uploadListener.unsubscribe();
        }
      });
    } catch (err) {
      console.error(err);
      if (err instanceof FolderResponse) {

      }
    }
  }

  async checkShareByUrl() {
    // check for share by URL parameter to display Request Access prompt
    if (this.route.snapshot.queryParams.shareByUrl) {
      const shareUrlToken = this.route.snapshot.queryParams.shareByUrl;

      let hasRequested = false;
      let hasAccess = false;

      // hit share/checkLink endpoint to check validity and get share data
      try {
        const checkLinkResponse: ShareResponse = await this.api.share.checkShareLink(shareUrlToken);

        const shareByUrlVO = checkLinkResponse.getShareByUrlVO();
        const shareVO = shareByUrlVO.ShareVO;
        const shareItem: RecordVO | FolderVO = shareByUrlVO.FolderVO || shareByUrlVO.RecordVO;
        const shareAccount: AccountVO = shareByUrlVO.AccountVO;

        if (shareVO && shareVO.status.includes('ok')) {
          hasAccess = true;
        } else if (shareVO && shareVO.status.includes('pending')) {
          hasRequested = true;
        }

        if (!hasAccess && !hasRequested) {
          // no access and no request
          const title = `Request access to ${shareItem.displayName} shared by ${shareAccount.fullName}?`;
          try {
            const deferred = new Deferred();
            await this.prompt.confirm('Request access', title, deferred.promise);
            try {
              await this.api.share.requestShareAccess(shareUrlToken);
              deferred.resolve();
              this.messageService.showMessage('Access requested.', 'success');
            } catch (err) {
              deferred.resolve();
              if (err instanceof ShareResponse) {
                if (err.messageIncludesPhrase('share.already_exists')) {
                  this.messageService.showError(`You have already requested access to this item.`);
                } else if (err.messageIncludesPhrase('same')) {
                  this.messageService.showError(`You do not need to request access to your own item.`);
                }
              }
            }
          } finally {
            // clear query param
            this.router.navigate(['.'], { relativeTo: this.route, queryParams: { shareByUrl: null },  });
          }
        } else if (hasRequested) {
          // show message about having requested already
          const msg = `You have already requested access to ${shareItem.displayName}. ${shareAccount.fullName} must approve your request.`;
          this.prompt.confirm('OK', msg);
          this.router.navigate(['.'], { relativeTo: this.route, queryParams: { shareByUrl: null },  });
        } else if (hasAccess) {
          // redirect to share in shares, already has access
          if (shareItem.isRecord) {
            this.router.navigate(['/shares', 'withme']);
          } else if (shareItem.isFolder) {
            this.router.navigate(['/shares', 'withme', shareItem.archiveNbr, shareItem.folder_linkId]);
          }
        }
      } catch (err) {
        console.error('Error checking link', err);
        if (err instanceof ShareResponse) {
          // checkLink failed for shareByUrl;
          this.messageService.showError('Invalid share URL.');
          this.router.navigate(['.'], { relativeTo: this.route, queryParams: { shareByUrl: null },  });
        }
      }
    }
  }

  // handle all file drag events
  @HostListener('dragenter', ['$event'])
  onDragEnter(event: any) {
    if (!this.isDraggingFile) {
      this.isDraggingFile = true;
      const dragEvent: DragServiceStartEndEvent = {
        type: 'start',
        targetTypes: ['folder'],
        srcComponent: this,
        event: event
      };

      this.drag.dispatch(dragEvent);
    }
  }

  // handle all file drag events
  @HostListener('dragleave', ['$event'])
  onDragLeave(event: any) {
    if (this.isDraggingFile && event.screenX === 0 && event.clientX === 0) {
      const dragEvent: DragServiceStartEndEvent = {
        type: 'end',
        targetTypes: ['folder'],
        srcComponent: this,
        event: event
      };

      this.drag.dispatch(dragEvent);
      this.isDraggingFile = false;
    }
  }


  // on file drop
  onDrop(dropTarget: DragTargetDroppableComponent, dragEvent: DragServiceEvent) {
    const files = (dragEvent.event as DragEvent).dataTransfer.files;
    this.isDraggingFile = false;

    if (!files.length) {
      return;
    }

    const items = (dragEvent.event as DragEvent).dataTransfer.items;

    let targetFolder: FolderVO;

    if (!dropTarget) {
      targetFolder = this.data.currentFolder;
    } else {
      targetFolder = this.drag.getDestinationFromDropTarget(dropTarget);
    }

    if (items?.length && items[0].webkitGetAsEntry != null) {
      // browser supports folders and file entry
      this.upload.uploadFolders(targetFolder, Array.from(items));
    } else {
      this.upload.uploadFiles(targetFolder, Array.from(files));
    }

  }
}
