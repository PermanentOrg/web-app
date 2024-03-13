/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiService } from '@shared/services/api/api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { LegacyContactDialogComponent } from './legacy-contact-dialog.component';

describe('LegacyContactDialogComponent', () => {
  let component: LegacyContactDialogComponent;
  let fixture: ComponentFixture<LegacyContactDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegacyContactDialogComponent],
      providers: [
        ApiService,
        {
          provide: AccountService,
          useValue: {
            getAccount: () => {
              return new AccountVO({ accountId: 1 });
            },
          },
        },
      ],
      imports: [HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LegacyContactDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
