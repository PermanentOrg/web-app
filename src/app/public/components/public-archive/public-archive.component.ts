import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArchiveVO } from '@models/index';

@Component({
  selector: 'pr-public-archive',
  templateUrl: './public-archive.component.html',
  styleUrls: ['./public-archive.component.scss']
})
export class PublicArchiveComponent implements OnInit {
  public archive: ArchiveVO;

  constructor(
    private route: ActivatedRoute
  ) {
    this.archive = this.route.snapshot.data['archive'];
  }

  ngOnInit() {
  }

}
