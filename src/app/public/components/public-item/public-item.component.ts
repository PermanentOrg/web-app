import { Component, OnInit } from '@angular/core';
import { RecordVO, FolderVO, ArchiveVO } from '@models/index';
import { ActivatedRoute } from '@angular/router';
import { find } from 'lodash';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'pr-public-item',
  templateUrl: './public-item.component.html',
  styleUrls: ['./public-item.component.scss']
})
export class PublicItemComponent implements OnInit {
  public isVideo = false;
  public isPdf = false;
  public showThumbnail = true;
  public record: RecordVO;
  public folder: FolderVO;
  public archive: ArchiveVO;

  public pdfUrl = null;

  constructor(
    route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    if (route.snapshot.data.publishedItem.recordId) {
      // record
      this.record = route.snapshot.data.publishedItem;
    } else {
      // folder
      this.folder = route.snapshot.data.publishedItem;
    }

    this.archive = route.snapshot.parent.data.archive;

    if (this.record) {
      this.initRecord();
    }
  }

  ngOnInit() {
  }

  getPdfUrl() {
    if (!this.isPdf) {
      return false;
    }

    const original = find(this.record.FileVOs, {format: 'file.format.original'}) as any;

    if (!original) {
      return false;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(original.fileURL);
  }

  initRecord() {
    this.isVideo = this.record.type.includes('video');
    this.isPdf = this.record.type.includes('pdf');
    this.pdfUrl = this.getPdfUrl();
  }

}
