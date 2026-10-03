import { ReactiveFormsModule } from '@angular/forms';
import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';
import { ComponentsModule } from '@root/app/component-library/components.module';
import { UnlistedShareSignupFooterComponent } from './unlisted-share-signup-footer.component';

const VALID_ACCOUNT_DETAILS = {
	email: 'jane@example.com',
	password: 'password123',
	confirmPassword: 'password123',
};

describe('UnlistedShareSignupFooterComponent', () => {
	let fixture: MockedComponentFixture<
		UnlistedShareSignupFooterComponent,
		{
			isSubmitting: boolean;
			onClosed: jasmine.Spy;
			onSignupSubmitted: jasmine.Spy;
		}
	>;
	let component: UnlistedShareSignupFooterComponent;
	let onClosed: jasmine.Spy;
	let onSignupSubmitted: jasmine.Spy;

	beforeEach(async () => {
		await MockBuilder(UnlistedShareSignupFooterComponent)
			.keep(ReactiveFormsModule)
			.keep(ComponentsModule);

		onClosed = jasmine.createSpy('onClosed');
		onSignupSubmitted = jasmine.createSpy('onSignupSubmitted');
		fixture = MockRender(
			`<pr-unlisted-share-signup-footer
				[isSubmitting]="isSubmitting"
				(closed)="onClosed()"
				(signupSubmitted)="onSignupSubmitted($event)"
			></pr-unlisted-share-signup-footer>`,
			{ isSubmitting: false, onClosed, onSignupSubmitted },
		);
		component = fixture.point.componentInstance;
	});

	const query = <T extends HTMLElement>(selector: string): T =>
		fixture.nativeElement.querySelector(selector);

	const isSignUpButtonDisabled = (): boolean =>
		query<HTMLButtonElement>('.sign-up-button button').disabled;

	const fillInAccountDetails = (
		accountDetails = VALID_ACCOUNT_DETAILS,
	): void => {
		component.accountDetailsForm.setValue(accountDetails);
		fixture.detectChanges();
	};

	const clickCheckbox = (checkboxClass: string): void => {
		query(`.${checkboxClass} .checkbox-container`).click();
		fixture.detectChanges();
	};

	it('should show the email, password and confirm password fields', () => {
		const fieldNames = Array.from(
			fixture.nativeElement.querySelectorAll('.signup-footer-field input'),
		).map((input: HTMLInputElement) => input.name);

		expect(fieldNames).toEqual(['email', 'password', 'confirmPassword']);
	});

	it('should invite the user to create an account above the consents', () => {
		expect(
			query('.consent-column .signup-footer-prompt').textContent.trim(),
		).toBe('Why not create an account?');
	});

	it('should start with both consent checkboxes unchecked', () => {
		expect(component.agreedToTerms()).toBeFalse();
		expect(component.receivesUpdatesViaEmail()).toBeFalse();
	});

	it('should disable sign up while the details are incomplete, even with the terms agreed to', () => {
		clickCheckbox('terms-checkbox');

		expect(isSignUpButtonDisabled()).toBeTrue();
	});

	it('should disable sign up when the passwords do not match', () => {
		fillInAccountDetails({
			...VALID_ACCOUNT_DETAILS,
			confirmPassword: 'somethingElse',
		});
		clickCheckbox('terms-checkbox');

		expect(isSignUpButtonDisabled()).toBeTrue();
	});

	it('should disable sign up until the terms are agreed to', () => {
		fillInAccountDetails();

		expect(isSignUpButtonDisabled()).toBeTrue();

		clickCheckbox('terms-checkbox');

		expect(component.agreedToTerms()).toBeTrue();
		expect(isSignUpButtonDisabled()).toBeFalse();
	});

	it('should not need the email updates checkbox to enable sign up', () => {
		fillInAccountDetails();
		clickCheckbox('receive-updates-checkbox');

		expect(component.receivesUpdatesViaEmail()).toBeTrue();
		expect(isSignUpButtonDisabled()).toBeTrue();
	});

	it('should hand the typed details and consents to its parent on sign up', () => {
		fillInAccountDetails();
		clickCheckbox('receive-updates-checkbox');
		clickCheckbox('terms-checkbox');
		query<HTMLButtonElement>('.sign-up-button button').click();

		expect(onSignupSubmitted).toHaveBeenCalledOnceWith({
			email: VALID_ACCOUNT_DETAILS.email,
			password: VALID_ACCOUNT_DETAILS.password,
			agreedToTerms: true,
			receivesUpdatesViaEmail: true,
		});
	});

	it('should not submit without the terms agreed to', () => {
		fillInAccountDetails();
		component.submit();

		expect(onSignupSubmitted).not.toHaveBeenCalled();
	});

	it('should disable sign up and refuse to submit again while submitting', () => {
		fillInAccountDetails();
		clickCheckbox('terms-checkbox');
		fixture.componentInstance.isSubmitting = true;
		fixture.detectChanges();

		expect(isSignUpButtonDisabled()).toBeTrue();

		component.submit();

		expect(onSignupSubmitted).not.toHaveBeenCalled();
	});

	it('should tell its parent when the close button is clicked', () => {
		query<HTMLButtonElement>('.signup-footer-close').click();

		expect(onClosed).toHaveBeenCalledTimes(1);
	});
});
