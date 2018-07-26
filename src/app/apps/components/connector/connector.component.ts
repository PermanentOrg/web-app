import { Component, Input, OnInit } from '@angular/core';
import { ConnectorOverviewVO } from '@root/app/models';

@Component({
  selector: 'pr-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss']
})
export class ConnectorComponent implements OnInit {
  @Input() connector: ConnectorOverviewVO;

  constructor() { }

  ngOnInit() {
    console.log('connector.component.ts', 15, this.connector);
  }

}
