/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiService } from '@shared/services/api/api.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { DirectiveDialogComponent } from './directive-dialog.component';

describe('DirectiveDialogComponent', () => {
  let component: DirectiveDialogComponent;
  let fixture: ComponentFixture<DirectiveDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [DirectiveDialogComponent],
    imports: [],
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
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(DirectiveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
