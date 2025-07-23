import { Component, Input, EventEmitter, Output } from '@angular/core';
import { faChevronDown } from '@fortawesome/pro-regular-svg-icons';

interface ShareLinkType {
	value: string;
	text: string;
	description?: string;
}

@Component({
	selector: 'pr-share-link-dropdown',
	templateUrl: './share-link-dropdown.component.html',
	styleUrl: './share-link-dropdown.component.scss',
	standalone: false,
})
export class ShareLinkDropdownComponent {
	@Input() linkTypes: ShareLinkType[] = [];
	@Output() valueChange = new EventEmitter<string>();
	@Input() value = '';

	public chevronIcon = faChevronDown;

	public displayedValue = 'Access';

	public displayDropdown = false;

	public onLinkTypeClick(value: string): void {
		this.displayDropdown = false;
		this.displayedValue = this.linkTypes.find(
			(linkType: ShareLinkType) => linkType.value === value,
		).text;
		this.valueChange.emit(value);
	}
}
