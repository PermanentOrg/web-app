/* @format  */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';

import { MfaComponent } from '@auth/components/mfa/mfa.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { MessageService } from '@shared/services/message/message.service';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';

describe('MfaComponent', () => {
	let component: MfaComponent;
	let fixture: ComponentFixture<MfaComponent>;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			declarations: [MfaComponent, LogoComponent],
			imports: [FormsModule, ReactiveFormsModule, RouterTestingModule],
			providers: [
				CookieService,
				MessageService,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		}).compileComponents();

		fixture = TestBed.createComponent(MfaComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set error for missing code', () => {
		component.mfaForm.get('token').markAsTouched();
		component.mfaForm.patchValue({
			token: '',
		});

		expect(component.mfaForm.invalid).toBeTruthy();
		expect(component.mfaForm.get('token').errors.required).toBeTruthy();
	});

	it('should display the loading spinner', () => {
		component.waiting = true;
		fixture.detectChanges();
		const compiled = fixture.debugElement.nativeElement;
		const loadingSpinner = compiled.querySelector('pr-loading-spinner');

		expect(loadingSpinner).toBeTruthy();
	});
});
