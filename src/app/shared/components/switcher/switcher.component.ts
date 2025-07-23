/* @format */
import { ArchiveVO } from '@models/archive-vo';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';

@Component({
	selector: 'pr-switcher',
	templateUrl: './switcher.component.html',
	styleUrls: ['./switcher.component.scss'],
	standalone: false,
})
export class SwitcherComponent {
	@Input() isChecked: boolean;
	@Input() change: (val: any) => void;
	@Input() archive: ArchiveVO;
	@Input() data: any;
	@ViewChild('switch', { static: false }) switch: ElementRef;
	constructor(private dialog: DialogCdkService) {}
}
