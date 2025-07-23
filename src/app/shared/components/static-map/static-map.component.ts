/* @format */
import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { LocnVOData, ItemVO } from '@models';
import { compact } from 'lodash';
import { SecretsService } from '../../services/secrets/secrets.service';

@Component({
  selector: 'pr-static-map',
  templateUrl: './static-map.component.html',
  styleUrls: ['./static-map.component.scss'],
  standalone: false,
})
export class StaticMapComponent implements OnChanges {
  private dpiScale = 1;
  private baseUrl = `https://maps.googleapis.com/maps/api/staticmap?key=${this.secrets.get(
    'GOOGLE_API_KEY',
  )}`;

  @Input() item: ItemVO;
  @Input() items: ItemVO[];
  @Input() location: LocnVOData;

  public imageUrl: string;

  private elementSize: number;

  constructor(
    private elementRef: ElementRef,
    private secrets: SecretsService,
  ) {
    this.dpiScale = (window ? window.devicePixelRatio > 1.75 : false) ? 2 : 1;
  }

  ngOnChanges(_: SimpleChanges): void {
    setTimeout(() => {
      this.buildUrl();
    });
  }

  buildUrl() {
    let locations: LocnVOData[];

    if (this.item) {
      locations = [this.item.LocnVO];
    } else if (this.items) {
      locations = this.items.map((i) => i.LocnVO);
    } else if (this.location) {
      locations = [this.location];
    }

    locations = compact(locations);

    if (!locations.length) {
      return (this.imageUrl = null);
    }

    const width = (this.elementRef.nativeElement as HTMLElement).clientWidth;
    const height = (this.elementRef.nativeElement as HTMLElement).clientHeight;

    let url = this.baseUrl;
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
