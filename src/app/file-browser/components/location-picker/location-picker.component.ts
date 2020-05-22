import { Component, OnInit, Input, Optional, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { ItemVO, ArchiveVO } from '@models';
import { DIALOG_DATA, DialogRef } from '@root/app/dialog/dialog.module';

const DEFAULT_ZOOM = 12;
const DEFAULT_CENTER: google.maps.LatLngLiteral = {
  lat: 39.8333333,
  lng: -98.585522
};

@Component({
  selector: 'pr-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit, AfterViewInit {
  @Input() item: ItemVO;
  @Input() archive: ArchiveVO;

  mapOptions: google.maps.MapOptions = {
    zoom: DEFAULT_ZOOM,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    clickableIcons: false
  };

  zoom = 4;
  center: google.maps.LatLng = new google.maps.LatLng(DEFAULT_CENTER);

  height: string;
  width: string;

  constructor(
    @Optional() @Inject(DIALOG_DATA) public dialogData: any,
    @Optional() private dialogRef: DialogRef,
    private elementRef: ElementRef
  ) {
    if (this.dialogData) {
      this.item = this.dialogData.item;
      this.archive = this.dialogData.archive;
    }

  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setMapDimensions();
    });
  }

  setMapDimensions() {
    const height = (this.elementRef.nativeElement as HTMLElement).clientHeight;
    const width = (this.elementRef.nativeElement as HTMLElement).clientWidth;

    this.height = `${height}px`;
    this.width = `${width}px`;
  }

}
