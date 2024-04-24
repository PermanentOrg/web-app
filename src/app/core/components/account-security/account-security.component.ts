import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pr-account-security',
  templateUrl: './account-security.component.html',
  styleUrl: './account-security.component.scss',
})
export class AccountSecurityComponent {
  display2fa = false;

  constructor(private router: ActivatedRoute) {
    this.router.queryParams.subscribe((params) => {
      this.display2fa = params['display2fa'] === 'dev';
    });
  }
}
