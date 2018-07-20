import { TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

export const BASE_TEST_CONFIG = {
  imports: [
    HttpClientModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    CookieService
  ],
  declarations: []
};

export {
  TestBed,
  async,
  FormsModule,
  ReactiveFormsModule,
  RouterTestingModule,
  HttpClientModule,
  CookieService
};
