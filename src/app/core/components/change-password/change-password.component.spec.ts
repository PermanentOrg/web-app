import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangePasswordComponent } from './change-password.component';

class MessageStub {
	public showMessage(_msg: string): void {}
}

describe('ChangePasswordComponent', () => {
	let component: ChangePasswordComponent;
	let fixture: ComponentFixture<ChangePasswordComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ChangePasswordComponent],
			imports: [ReactiveFormsModule],
			providers: [
				{
					provide: MessageService,
					useClass: MessageStub,
				},
				{
					provide: AccountService,
					useValue: { getAccount: () => ({}) },
				},
				{
					provide: PromptService,
					useValue: { prompt: async () => ({}) },
				},
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ChangePasswordComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
