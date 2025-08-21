import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';

@Component({
	selector: 'pr-onboarding-header',
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
	standalone: false,
})
export class OnboardingHeaderComponent {
	@Input() public accountName: string = '';

	constructor(
		private account: AccountService,
		private router: Router,
	) {}

	public logOut(): void {
		this.account.clear();
		this.router.navigate(['/app', 'auth']);
	}
}
