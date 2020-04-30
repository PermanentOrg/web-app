import { Component, OnInit } from '@angular/core';

type SidebarTab =  'info' | 'details' | 'sharing';
@Component({
  selector: 'pr-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentTab: SidebarTab = 'info';

  constructor() { }

  ngOnInit() {
  }

  setCurrentTab(tab: SidebarTab) {
    this.currentTab = tab;
  }

}
