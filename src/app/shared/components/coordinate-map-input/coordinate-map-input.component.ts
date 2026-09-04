import {
	Component,
	computed,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	signal,
	ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { IconTextInputComponent } from '@shared/components/icon-text-input/icon-text-input.component';
import {
	Coordinates,
	formatCoordinates,
	parseCoordinates,
} from '@shared/utilities/coordinates';
import { faLocationCrosshairs } from '@fortawesome/pro-regular-svg-icons';

const CONTINENTAL_US_CENTER: google.maps.LatLngLiteral = {
	lat: 39.8333333,
	lng: -98.585522,
};

const LOCATED_ZOOM = 12;
const WHOLE_COUNTRY_ZOOM = 4;

const MAP_PIN_ICON_URL = 'assets/svg/map-pin.svg';

const toLatLngLiteral = (
	coordinates: Coordinates,
): google.maps.LatLngLiteral => ({
	lat: coordinates.latitude,
	lng: coordinates.longitude,
});

const isSamePlace = (a: Coordinates | null, b: Coordinates | null): boolean =>
	a?.latitude === b?.latitude && a?.longitude === b?.longitude;

@Component({
	selector: 'pr-coordinate-map-input',
	standalone: true,
	imports: [CommonModule, GoogleMapsModule, IconTextInputComponent],
	templateUrl: './coordinate-map-input.component.html',
	styleUrls: ['./coordinate-map-input.component.scss'],
})
export class CoordinateMapInputComponent implements OnChanges {
	@Input() coordinates: Coordinates | null = null;
	@Input() label = 'Add coordinates…';
	@Input() height = '400px';

	@Output() coordinatesChange = new EventEmitter<Coordinates | null>();
	@Output() validityChange = new EventEmitter<boolean>();

	readonly coordinateIcon = faLocationCrosshairs;

	readonly markerOptions: google.maps.MarkerOptions = {
		icon: { url: MAP_PIN_ICON_URL },
	};

	mapOptions: google.maps.MapOptions = {
		zoom: WHOLE_COUNTRY_ZOOM,
		center: CONTINENTAL_US_CENTER,
		streetViewControl: false,
		fullscreenControl: false,
		mapTypeControl: false,
		clickableIcons: false,
	};

	coordinateText = signal('');

	currentCoordinates = signal<Coordinates | null>(null);

	markerPosition = computed<google.maps.LatLngLiteral | null>(() => {
		const coordinates = this.currentCoordinates();
		return coordinates ? toLatLngLiteral(coordinates) : null;
	});

	isValid = computed<boolean>(() => {
		const text = this.coordinateText().trim();
		return !text || parseCoordinates(text) !== null;
	});

	@ViewChild(GoogleMap) map?: GoogleMap;

	private hasCentredOnAPlace = false;

	ngOnChanges(): void {
		if (isSamePlace(this.coordinates, this.currentCoordinates())) {
			return;
		}
		this.currentCoordinates.set(this.coordinates);
		this.coordinateText.set(
			this.coordinates ? formatCoordinates(this.coordinates) : '',
		);
		this.centreOnFirstPlace();
	}

	public onMapClick(event: google.maps.MapMouseEvent): void {
		if (!event.latLng) {
			return;
		}
		const coordinates: Coordinates = {
			latitude: event.latLng.lat(),
			longitude: event.latLng.lng(),
		};
		this.currentCoordinates.set(coordinates);
		this.coordinateText.set(formatCoordinates(coordinates));
		this.report();
	}

	public onCoordinateTextChange(text: string): void {
		this.coordinateText.set(text);

		if (!text.trim()) {
			this.currentCoordinates.set(null);
			this.report();
			return;
		}

		const coordinates = parseCoordinates(text);
		if (!coordinates) {
			this.report();
			return;
		}
		this.currentCoordinates.set(coordinates);
		this.panMapTo(coordinates);
		this.report();
	}

	private report(): void {
		this.coordinatesChange.emit(this.currentCoordinates());
		this.validityChange.emit(this.isValid());
	}

	private centreOnFirstPlace(): void {
		const coordinates = this.currentCoordinates();
		if (!coordinates || this.hasCentredOnAPlace) {
			return;
		}
		this.hasCentredOnAPlace = true;
		this.mapOptions = {
			...this.mapOptions,
			zoom: LOCATED_ZOOM,
			center: toLatLngLiteral(coordinates),
		};
	}

	private isGoogleMapsApiReady(): boolean {
		return Boolean(this.map?.googleMap);
	}

	private panMapTo(coordinates: Coordinates): void {
		if (!this.isGoogleMapsApiReady()) {
			return;
		}
		this.map.panTo(toLatLngLiteral(coordinates));
	}
}
