import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { generateElementText } from '../../../utils/utils';
import {
	archiveOptionsWithArticle,
	archiveCreationHeaderText,
	archiveOptions,
} from '../types/archive-types';
import { OnboardingService } from '../../../services/onboarding.service';

@Component({
	selector: 'pr-select-archive-type-screen',
	templateUrl: './select-archive-type-screen.component.html',
	styleUrl: './select-archive-type-screen.component.scss',
	standalone: false,
})
export class SelectArchiveTypeScreenComponent implements OnInit {
	selectedValue = '';
	buttonText = 'a Personal';
	public headerText: string = '';
	@Input() tag: string = '';
	public type: string = '';

	@Output() submitEmitter = new EventEmitter<Record<string, string>>();

	constructor(private onboardingService: OnboardingService) {}

	ngOnInit(): void {
		const storageTag = this.onboardingService.getArchiveTypeTag();
		const storageType = this.onboardingService.getArchiveType();

		if (storageTag && storageType) {
			this.tag = storageTag;
			this.type = storageType;
		}

		if (this.tag) {
			this.buttonText = generateElementText(
				this.tag,
				archiveOptionsWithArticle,
			);
		}
	}

	public navigate(screen) {
		this.submitEmitter.emit({
			screen,
			type: this.type,
			tag: this.tag,
			headerText: this.headerText,
		});
	}

	public onValueChange(event: string): void {
		this.tag = event;
		this.type = archiveOptions.find((val) => val.type === event).value;
		this.selectedValue = `${this.type}+${event}`;
		this.buttonText = generateElementText(event, archiveOptionsWithArticle);
		this.headerText = generateElementText(event, archiveCreationHeaderText);
	}
}
