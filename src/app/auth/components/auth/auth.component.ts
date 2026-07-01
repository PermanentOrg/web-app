import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'pr-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class AuthComponent {}
