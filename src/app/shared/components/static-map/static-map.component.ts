import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { LocnVOData } from '@models';
import { environment } from '@root/environments/environment';
import { compact } from 'lodash';

const BASE_URL = `https://maps.googleapis.com/maps/api/staticmap?key=${environment.google.apiKey}`;

@Component({
  selector: 'pr-static-map',
  templateUrl: './static-map.component.html',
  styleUrls: ['./static-map.component.scss']
})
export class StaticMapComponent implements OnInit, OnChanges, AfterViewInit {
  private dpiScale = 1;

  @Input() locations: LocnVOData | LocnVOData[];

  public imageUrl: string;

  private elementSize: number;

  constructor(
    private elementRef: ElementRef
  ) {
    this.dpiScale = (window ? window.devicePixelRatio > 1.75 : false) ? 2 : 1;
  }

  ngOnInit(): void {
    this.buildUrl();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildUrl();
  }

  ngAfterViewInit() {
  }

  buildUrl() {
    let locations: LocnVOData[];

    if (!Array.isArray(this.locations)) {
      locations = [ this.locations ];
    }

    locations = compact(locations);
    if (!locations.length) {
      return this.imageUrl = null;
    }

    const width = (this.elementRef.nativeElement as HTMLElement).clientWidth;
    const height = (this.elementRef.nativeElement as HTMLElement).clientHeight;

    let url = BASE_URL;
    for (const locn of locations) {
      url += `&markers=${locn.latitude},${locn.longitude}`;
    }

    if (locations.length === 1) {
      url += '&zoom=10';
    }

    url += `&size=${width}x${height}&scale=${this.dpiScale}`;

    if (url !== this.imageUrl) {
      this.imageUrl = url;
    }
  }
}
