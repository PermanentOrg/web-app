import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AccountService } from '../../../shared/services/account/account.service';
import { AuthResponse } from '../../../shared/services/api/auth.repo';
import { Router } from '@angular/router';

@Component({
  selector: 'pr-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  waiting: Boolean;

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router) {
    this.loginForm = fb.group({
      'email': ['aatwood@permanent.org'],
      'password': ['yomama0101']
    });
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.logIn(formValue.email, formValue.password, true, true)
      .then((response: AuthResponse) => {
        this.waiting = false;

        if (response.needsMFA()) {
          console.log('going to verify!');
        } else {
          this.router.navigate(['/app']);
        }
      })
      .catch((response: AuthResponse) => {
        console.error(response);
        this.waiting = false;
      });
  }

}
