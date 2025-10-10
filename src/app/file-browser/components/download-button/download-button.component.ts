import {
	Component,
	Input,
	ElementRef,
	ViewChild,
	HostListener,
} from '@angular/core';
import { RecordVO } from '@models/index';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '../../../shared/services/message/message.service';

interface Format {
	name: string;
	extension: string;
}

@Component({
	selector: 'pr-download-button',
	templateUrl: './download-button.component.html',
	styleUrls: ['./download-button.component.scss'],
	standalone: false,
})
export class DownloadButtonComponent {
	@Input() selectedItem;

	displayDownloadDropdown = false;
	downloadOptions: Format[] = [];
	@Input() isFileView = false;

	@ViewChild('downloadButton') downloadButton: ElementRef;
	@ViewChild('downloadButtonDropdown', { static: false })
	downloadButtonDropdown: ElementRef;

	constructor(
		private data: DataService,
		private message: MessageService,
	) {}

	@HostListener('document:click', ['$event'])
	handleClickOutside(event) {
		const clickedElement = event.target as HTMLElement;
		const isClickedInside =
			this.downloadButton.nativeElement.contains(clickedElement);
		if (!isClickedInside && this.displayDownloadDropdown) {
			this.displayDownloadDropdown = false;
		}
	}

	async downloadClick() {
		if (this.selectedItem instanceof RecordVO) {
			if (this.displayDownloadDropdown) {
				this.displayDownloadDropdown = false;
				this.downloadOptions = [];
			} else {
				this.displayDownloadOptions();
				this.bringDropdownIntoView();
			}
		} else {
			try {
				await this.data.createZipForDownload([this.selectedItem]);
				this.message.showMessage({
					message:
						'Your zip file is being created. An in-app notification will let you know when it is ready to download.',
					style: 'success',
				});
			} catch (err) {
				this.message.showError({
					message: 'There was a problem creating a zip file to download',
					translate: false,
				});
			}
		}
	}

	onFileTypeClick(fileName: string) {
		this.data.downloadFile(this.selectedItem, fileName);
	}

	displayDownloadOptions() {
		this.displayDownloadDropdown = true;
		this.downloadOptions = (
			this.selectedItem as RecordVO
		).getDownloadOptionsList();
	}

	bringDropdownIntoView() {
		this.downloadButton.nativeElement.scrollIntoView();
	}
}
