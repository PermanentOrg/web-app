/* @format */
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';
import { ArchiveVO } from '@models/archive-vo';

@Component({
	selector: 'pr-welcome-screen',
	templateUrl: './welcome-screen.component.html',
	styleUrls: ['./welcome-screen.component.scss'],
	standalone: false,
})
export class WelcomeScreenComponent {
	@Input() pendingArchives: ArchiveVO[] = [];
	@Output() nextScreen = new EventEmitter<OnboardingScreen>();
	@Output() selectInvitation = new EventEmitter<ArchiveVO>();

	selectedValue: string = '';
	name: string = '';

	public OnboardingScreen: typeof OnboardingScreen = OnboardingScreen;

	constructor() {}

	public goToScreen(screen: OnboardingScreen): void {
		this.nextScreen.emit(screen);
	}

	public selectPendingArchive(archive: ArchiveVO): void {
		this.selectInvitation.emit(archive);
	}
}
