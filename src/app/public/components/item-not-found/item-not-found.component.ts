import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'pr-item-not-found',
	templateUrl: './item-not-found.component.html',
	styleUrls: ['./item-not-found.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class ItemNotFoundComponent implements OnInit {
	ngOnInit() {
		setTimeout(() => {
			window.location.assign('/');
		}, 5000);
	}
}
