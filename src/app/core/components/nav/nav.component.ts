import { Component, OnInit, HostBinding } from '@angular/core';

@Component({
  selector: 'pr-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  hambugerMenuVisible: boolean;
  rightMenuVisible: boolean;

  constructor() {
  }

  ngOnInit() {
  }

  showHamburgerMenu() {
    this.hambugerMenuVisible = true;
  }

  hideHamburgerMenu() {
    this.hambugerMenuVisible = false;
  }

  showRightMenu() {
    this.rightMenuVisible = true;
  }

  hideRightMenu() {
    this.rightMenuVisible = false;
  }

}
