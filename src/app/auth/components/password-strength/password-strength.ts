import { Component, Input, OnChanges } from '@angular/core';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { passwordStrength } from 'check-password-strength';

enum PasswordStrength {
	Null = 'null',
	Weak = 'weak',
	Medium = 'medium',
	Strong = 'strong',
}

@Component({
	selector: 'pr-password-strength',
	templateUrl: './password-strength.html',
	styleUrls: ['./password-strength.scss'],
	standalone: false,
})
export class PasswordStrengthComponent implements OnChanges {
	@Input() password: string = '';

	public progressBars: [string, string, string] = ['', '', ''];
	public strength: PasswordStrength = PasswordStrength.Null;
	public message: string = '';
	public passwordClass: string = '';
	public enabledPasswordCheckStrength: boolean;

	private readonly strengthConfig: {
		[key in PasswordStrength]: {
			message: string;
			class: string;
			progressBars: [string, string, string];
		};
	} = {
		[PasswordStrength.Null]: {
			message: '',
			class: '',
			progressBars: ['', '', ''],
		},
		[PasswordStrength.Weak]: {
			message: 'weak',
			class: 'too-weak',
			progressBars: ['weak', '', ''],
		},
		[PasswordStrength.Medium]: {
			message: 'medium',
			class: 'weak',
			progressBars: ['half', 'half', ''],
		},
		[PasswordStrength.Strong]: {
			message: 'strong',
			class: 'strong',
			progressBars: ['filled', 'filled', 'filled'],
		},
	};

	constructor(private feature: FeatureFlagService) {
		this.enabledPasswordCheckStrength =
			this.feature.isEnabled('password-strength');
	}

	ngOnChanges(): void {
		if (this.enabledPasswordCheckStrength) {
			this.updatePasswordStrength();
		}
	}

	private setStrength(strengthId: number): void {
		switch (strengthId) {
			case 0:
				({ Weak: this.strength } = PasswordStrength);
				break;
			case 1:
				({ Medium: this.strength } = PasswordStrength);
				break;
			case 3:
				({ Strong: this.strength } = PasswordStrength);
				break;
			default:
				({ Null: this.strength } = PasswordStrength);
		}

		({
			message: this.message,
			class: this.passwordClass,
			progressBars: this.progressBars,
		} = this.strengthConfig[this.strength]);
	}

	private updatePasswordStrength(): void {
		const strength = passwordStrength(this.password);
		this.setStrength(strength.id);
	}
}
