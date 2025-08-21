import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IFrameService } from '@shared/services/iframe/iframe.service';

@Component({
	selector: 'pr-pledge',
	templateUrl: './pledge.component.html',
	styleUrls: ['./pledge.component.scss'],
	standalone: false,
})
export class PledgeComponent implements OnInit {
	@HostBinding('class.for-light-bg') forLightBg = true;
	@HostBinding('class.for-dark-bg') forDarkBg = false;
	@HostBinding('class.visible') visible = false;

	constructor(
		private route: ActivatedRoute,
		public iFrame: IFrameService,
	) {
		this.forLightBg = this.route.snapshot.queryParams.theme === 'forLightBg';
		this.forDarkBg = this.route.snapshot.queryParams.theme === 'forDarkBg';
	}

	ngOnInit() {
		setTimeout(() => {
			this.visible = true;
		});
	}
}
