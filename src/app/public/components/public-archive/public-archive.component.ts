import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ArchiveVO } from '@models/index';

@Component({
  selector: 'pr-public-archive',
  templateUrl: './public-archive.component.html',
  styleUrls: ['./public-archive.component.scss']
})
export class PublicArchiveComponent implements OnInit {
  public archive: ArchiveVO;
  public description: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.ngOnInit();
      }
    });
  }

  ngOnInit() {
    this.archive = this.route.snapshot.data['archive'];

    if (this.archive.description) {
      this.description = '<p>' + this.archive.description.replace(new RegExp('\n', 'g'), '</p><p>') + '</>';
    } else {
      this.description = null;
    }
  }

}
