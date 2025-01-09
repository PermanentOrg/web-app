/* @format */
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
})
export class PasswordStrengthComponent implements OnChanges {
  progressBars: string[] = ['', '', ''];

  public strength: PasswordStrength = PasswordStrength.Null;
  public message: string = '';
  public passwordClass: string = '';
  @Input() password: string = '';
  public enabledPasswordCheckStrength: boolean;

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
        this.strength = PasswordStrength.Weak;
        this.message = 'weak';
        this.passwordClass = 'too-weak';
        this.progressBars = ['weak', '', ''];
        break;
      case 1:
        this.strength = PasswordStrength.Medium;
        this.message = 'medium';
        this.passwordClass = 'weak';
        this.progressBars = ['half', 'half', ''];
        break;
      case 3:
        this.strength = PasswordStrength.Strong;
        this.message = 'strong';
        this.passwordClass = 'strong';
        this.progressBars = ['filled', 'filled', 'filled'];
        break;
      default:
        this.strength = PasswordStrength.Null;
        this.message = '';
        this.passwordClass = '';
        this.progressBars = ['', '', ''];
    }
  }

  private updatePasswordStrength(): void {
    const strength = passwordStrength(this.password);
    this.setStrength(strength.id);
  }
}
