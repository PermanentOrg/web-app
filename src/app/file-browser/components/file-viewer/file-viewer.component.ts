import { Component, OnInit, OnDestroy, ElementRef, Inject} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RecordVO } from '@root/app/models';

@Component({
  selector: 'pr-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit, OnDestroy {
  record: RecordVO;

  private viewerElement: Element;
  private bodyScroll: number;

  constructor(private router: Router, private route: ActivatedRoute, private element: ElementRef, @Inject(DOCUMENT) private document: any) {
    this.record = route.snapshot.data.currentRecord;
  }

  ngOnInit() {
    this.viewerElement = this.element.nativeElement.querySelector('.file-viewer');
    this.document.body.style.setProperty('overflow', 'hidden');
  }

  ngOnDestroy() {
    this.document.body.style.setProperty('overflow', '');
  }

  close() {
    const routeParams = this.route.parent.snapshot.params;
    if (routeParams.archiveNbr) {
      this.router.navigate(['/myfiles', routeParams.archiveNbr, routeParams.folderLinkId]);
    } else {
      this.router.navigate(['/myfiles']);
    }
    return false;
  }

}
