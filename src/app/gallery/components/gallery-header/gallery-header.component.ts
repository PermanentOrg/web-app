import { Component, Input, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';

@Component({
  selector: 'pr-gallery-header',
  templateUrl: './gallery-header.component.html',
  styleUrls: ['./gallery-header.component.scss'],
})
export class GalleryHeaderComponent implements OnInit {
  public isLoggedIn: boolean;

  constructor(protected account: AccountService) {
    this.isLoggedIn = this.account.isLoggedIn();
  }

  ngOnInit(): void {}
}
