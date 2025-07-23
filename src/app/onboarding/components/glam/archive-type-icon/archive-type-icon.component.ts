import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
	faBuildingColumns,
	faFamily,
	faHeart,
	faPeopleGroup,
	faScrollOld,
	faShapes,
	faSquareEllipsis,
	faUser,
} from '@fortawesome/pro-regular-svg-icons';
import { OnboardingTypes } from '@root/app/onboarding/shared/onboarding-screen';

@Component({
	selector: 'pr-archive-type-icon',
	imports: [FontAwesomeModule],
	templateUrl: './archive-type-icon.component.html',
})
export class ArchiveTypeIconComponent {
	@Input() public type: OnboardingTypes = OnboardingTypes.myself;
	public readonly icons: Record<OnboardingTypes, typeof faHeart> = {
		'type:myself': faHeart,
		'type:individual': faUser,
		'type:family': faFamily,
		'type:famhist': faScrollOld,
		'type:community': faPeopleGroup,
		'type:org': faBuildingColumns,
		'type:other': faSquareEllipsis,
		'type:unsure': faShapes,
	};
}
