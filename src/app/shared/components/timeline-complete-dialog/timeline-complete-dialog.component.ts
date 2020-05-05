import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { FolderVO } from '@models';
import { copyFromInputElement } from '@shared/utilities/forms';
import { PublicLinkPipe } from '@shared/pipes/public-link.pipe';
import { EVENTS } from '@shared/services/google-analytics/events';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';

@Component({
  selector: 'pr-timeline-complete-dialog',
  templateUrl: './timeline-complete-dialog.component.html',
  styleUrls: ['./timeline-complete-dialog.component.scss']
})
export class TimelineCompleteDialogComponent implements OnInit {
  public folder: FolderVO;
  public publicLink: string;

  public linkCopied = false;
  @ViewChild('publicLinkInput', { static: false }) publicLinkInput: ElementRef;

  constructor(
    private dialogRef: DialogRef,
    private linkPipe: PublicLinkPipe,
    private ga: GoogleAnalyticsService,
    @Inject(DIALOG_DATA) public data: any,
  ) {
    this.folder = this.data.folder;
    this.publicLink = linkPipe.transform(this.folder);
  }

  ngOnInit() {
  }

  copyPublicLink() {
    this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.getLink.params);

    const element = this.publicLinkInput.nativeElement as HTMLInputElement;

    copyFromInputElement(element);

    this.linkCopied = true;
    setTimeout(() => {
      this.linkCopied = false;
    }, 5000);
  }

  close() {
    this.dialogRef.close();
  }

}
