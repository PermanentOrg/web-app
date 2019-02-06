import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import APP_CONFIG from '@root/app/app.config';



@Component({
  selector: 'pr-newsletter-signup',
  templateUrl: './newsletter-signup.component.html',
  styleUrls: ['./newsletter-signup.component.scss']
})
export class NewsletterSignupComponent implements OnInit {
  mailchimpEndpoint = 'https://permanent.us12.list-manage.com/subscribe/post-json?u=2948a82c4a163d7ab43a13356&amp;id=487bd863fb&';
  mailchimpForm: FormGroup;
  mailchimpError: string;
  mailchimpSent = false;
  existingMember = false;

  waiting = false;

  signupForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.mailchimpForm = fb.group({
      email: ['', [ Validators.required, Validators.email ]]
    });

    this.signupForm = fb.group({
      invitation: [''],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(APP_CONFIG.passwordMinLength)]],
      agreed: [false, [Validators.requiredTrue]],
      optIn: [true]
    });
  }

  ngOnInit() {
  }

  onMailchimpSubmit(formValue) {
    this.waiting = true;
    this.mailchimpError = null;
    const params = new HttpParams()
      .set('EMAIL', formValue.email)
      .set('b_2948a82c4a163d7ab43a13356_487bd863fb', '');

    const url = this.mailchimpEndpoint + params.toString().replace('+', '%2B');
    this.http.jsonp(url, 'c').subscribe((response: any) => {
        this.waiting = false;
        this.signupForm.patchValue({
          email: formValue.email
        });
        if (response.msg.includes('already')) {
          this.mailchimpSent = true;
          this.existingMember = true;
        } else if (response.result === 'error') {
          this.mailchimpError = response.msg;
        } else {
          this.mailchimpError = null;
          this.mailchimpSent = true;
        }
      }, error => {
        this.waiting = false;
        this.mailchimpError = 'Sorry, an error occurred';
      });
  }

  onSignupSubmit(formValue) {

  }

}
