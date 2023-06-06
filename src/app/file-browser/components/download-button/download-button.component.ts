/* @format */
import { MessageService } from './../../../shared/services/message/message.service';
import {
  Component,
  Input,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { RecordVO } from '@models/index';
import { DataService } from '@shared/services/data/data.service';

interface Format {
  name: string;
  extension: string;
}

@Component({
  selector: 'pr-download-button',
  templateUrl: './download-button.component.html',
  styleUrls: ['./download-button.component.scss'],
})
export class DownloadButtonComponent implements OnInit {
  @Input() selectedItem;

  displayDownloadDropdown = false;
  downloadOptions: Format[] = [];
  @Input() isFileView = false;

  @ViewChild('downloadButton') downloadButton: ElementRef;
  @ViewChild('downloadButtonDropdown', { static: false })
  downloadButtonDropdown: ElementRef;

  constructor(private data: DataService, private message: MessageService) {}

  ngOnInit(): void {}

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
    if (this.selectedItem instanceof RecordVO && this.selectedItem.FileVOs) {
      if (!this.displayDownloadDropdown) {
        this.displayDownloadOptions();
        this.bringDropdownIntoView();
      } else {
        this.displayDownloadDropdown = false;
        this.downloadOptions = [];
      }
    } else {
      try {
        await this.data.createZipForDownload([this.selectedItem]);
        this.message.showMessage(
          'Your zip file is being created. An in-app notification will let you know when it is ready to download.',
          'success'
        );
      } catch (err) {
        this.message.showError(
          'There was a problem creating a zip file to download',
          false
        );
      }
    }
  }

  onFileTypeClick(fileName: string) {
    this.data.downloadFile(this.selectedItem, fileName);
  }

  displayDownloadOptions() {
    this.displayDownloadDropdown = true;
    const original = (this.selectedItem as RecordVO).FileVOs.find(
      (item) => item.format === 'file.format.original'
    );
    const converted = (this.selectedItem as RecordVO).FileVOs.filter(
      (item) => item.format === 'file.format.converted'
    ).map((item) => ({
      name: item.type,
      extension: item.type.split('.').pop(),
    }));
    this.downloadOptions = [
      { name: original?.type, extension: original?.type.split('.').pop() },
      ...converted,
    ];
  }

  bringDropdownIntoView() {
      this.downloadButton.nativeElement.scrollIntoView();
  }
}
