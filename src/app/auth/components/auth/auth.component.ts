import { Component } from '@angular/core';
import {
	faLeafOak,
	faListCheck,
	faCircleVideo,
	faUserGroupSimple,
} from '@fortawesome/pro-regular-svg-icons';

@Component({
	selector: 'pr-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
	standalone: false,
})
export class AuthComponent {
	openLegacyLab() {
		window.open('http://permanent.org/legacy-lab/', '_self');
	}

	public leafOakIcon = faLeafOak;
	public listCheckIcon = faListCheck;
	public circleVideoIcon = faCircleVideo;
	public userGroupSimpleIcon = faUserGroupSimple;
}
