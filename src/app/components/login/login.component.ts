import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AccountService } from '../../core/services/account/account.service';
import { AuthResponse } from '../../core/services/api/auth.repo';

@Component({
  selector: 'pr-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  waiting: Boolean;

  constructor(private fb: FormBuilder, private accountService: AccountService) {
    this.loginForm = fb.group({
      'username': ['aatwood@permanent.org'],
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
      })
      .catch((err: Error) => {
        console.log(err.message);
        this.waiting = false;
      });
  }

}
