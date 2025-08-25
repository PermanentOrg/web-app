import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'pr-onboarding-glam-header',
	templateUrl: './glam-header.component.html',
	styleUrl: './glam-header.component.scss',
	standalone: false,
})
export class GlamOnboardingHeaderComponent {
	public readonly faArrowRight = faArrowRight;

	constructor(
		private account: AccountService,
		private router: Router,
	) {}

	public logOut(): void {
		this.account.clear();
		this.router.navigate(['/app', 'auth']);
	}
}
