import { Component, OnInit } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';

@Component({
  selector: 'pr-multi-select-status',
  templateUrl: './multi-select-status.component.html',
  styleUrls: ['./multi-select-status.component.scss']
})
export class MultiSelectStatusComponent implements OnInit {

  constructor(
    private data: DataService
  ) { }

  ngOnInit() {
  }

}
