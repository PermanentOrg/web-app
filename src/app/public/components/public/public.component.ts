import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pr-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  @HostBinding('class.for-record') isRecord: boolean;

  constructor(
    private route: ActivatedRoute
  ) {
    this.isRecord = route.snapshot.firstChild.data.isRecord;
  }

  ngOnInit() {
  }

}
