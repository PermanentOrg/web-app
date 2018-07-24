import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RecordVO } from '@root/app/models';

@Component({
  selector: 'pr-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit {
  record: RecordVO;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.record = route.snapshot.data.currentRecord;
  }

  ngOnInit() {
  }

  close() {
    const routeParams = this.route.parent.snapshot.params;
    if (routeParams.archiveNbr) {
      this.router.navigate(['/myfiles', routeParams.archiveNbr, routeParams.folderLinkId]);
    } else {
      this.router.navigate(['/myfiles']);
    }
  }

}
