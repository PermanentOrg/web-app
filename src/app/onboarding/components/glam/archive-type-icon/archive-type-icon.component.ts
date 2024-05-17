import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faUser } from '@fortawesome/free-regular-svg-icons';
import { faScroll } from '@fortawesome/free-solid-svg-icons';
import { OnboardingTypes } from '@root/app/onboarding/shared/onboarding-screen';

@Component({
  selector: 'pr-archive-type-icon',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './archive-type-icon.component.html',
})
export class ArchiveTypeIconComponent {
  @Input() public type: OnboardingTypes = OnboardingTypes.myself;
  public readonly icons = {
    'type:myself': faHeart,
    'type:individual': faUser,
    'type:family': faHeart,
    'type:famhist': faScroll,
  };
}
