/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { AccountSecurityComponent } from './account-security.component';

describe('AccountSecurityComponent', () => {
  let component: AccountSecurityComponent;
  let fixture: ComponentFixture<AccountSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountSecurityComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of(convertToParamMap({ display2fa: 'dev' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
