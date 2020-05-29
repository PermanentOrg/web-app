import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'pr-beta-toggle',
  templateUrl: './beta-toggle.component.html',
  styleUrls: ['./beta-toggle.component.scss']
})
export class BetaToggleComponent implements OnInit {
  constructor(
    private cookie: CookieService
  ) { }

  ngOnInit(): void {
  }

  onClick() {
    this.cookie.delete('permBeta', '/', `.${window.location.hostname}`);
    console.log(this.cookie.get('permBeta'));
  }
}
