import {
	Component,
	computed,
	effect,
	input,
	linkedSignal,
	model,
	output,
	ViewChild,
} from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { IconTextInputComponent } from '@shared/components/icon-text-input/icon-text-input.component';
import {
	Coordinates,
	formatCoordinates,
	namesAPlaceOnEarth,
	parseCoordinates,
} from '@shared/utilities/coordinates';
import {
	CONTINENTAL_US_CENTER,
	LOCATED_ZOOM,
	WHOLE_COUNTRY_ZOOM,
} from '@shared/utilities/map-view';
import { faLocationCrosshairs } from '@fortawesome/pro-regular-svg-icons';

const MAP_PIN_ICON_URL = 'assets/svg/map-pin.svg';

const toLatLngLiteral = (
	coordinates: Coordinates,
): google.maps.LatLngLiteral => ({
	lat: coordinates.latitude,
	lng: coordinates.longitude,
});

const isSamePlace = (a: Coordinates | null, b: Coordinates | null): boolean =>
	a?.latitude === b?.latitude && a?.longitude === b?.longitude;

const textNamesPlace = (
	text: string,
	coordinates: Coordinates | null,
): boolean => {
	const parsed = parseCoordinates(text);
	return parsed !== null && isSamePlace(parsed, coordinates);
};

@Component({
	selector: 'pr-coordinate-map-input',
	standalone: true,
	imports: [GoogleMapsModule, IconTextInputComponent],
	templateUrl: './coordinate-map-input.component.html',
	styleUrls: ['./coordinate-map-input.component.scss'],
})
export class CoordinateMapInputComponent {
	coordinates = model<Coordinates | null>(null);
	label = input('Add coordinates…');
	height = input('400px');

	validityChange = output<boolean>();

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

	coordinateText = linkedSignal<Coordinates | null, string>({
		source: this.coordinates,
		computation: (coordinates, previous) => {
			if (previous && textNamesPlace(previous.value, coordinates)) {
				return previous.value;
			}
			return coordinates ? formatCoordinates(coordinates) : '';
		},
	});

	markerPosition = computed<google.maps.LatLngLiteral | null>(() => {
		const coordinates = this.coordinates();
		return coordinates && namesAPlaceOnEarth(coordinates)
			? toLatLngLiteral(coordinates)
			: null;
	});

	isValid = computed<boolean>(() => {
		const text = this.coordinateText().trim();
		return !text || parseCoordinates(text) !== null;
	});

	@ViewChild(GoogleMap) map?: GoogleMap;

	private hasCentredOnAPlace = false;

	constructor() {
		effect(() => this.centreOnFirstPlace(this.coordinates()));
		effect(() => this.validityChange.emit(this.isValid()));
	}

	public onMapClick(event: google.maps.MapMouseEvent): void {
		if (!event.latLng) {
			return;
		}
		this.hasCentredOnAPlace = true;
		this.coordinates.set({
			latitude: event.latLng.lat(),
			longitude: event.latLng.lng(),
		});
	}

	public onCoordinateTextChange(text: string): void {
		this.coordinateText.set(text);

		if (!text.trim()) {
			this.coordinates.set(null);
			return;
		}

		const coordinates = parseCoordinates(text);
		if (!coordinates) {
			return;
		}
		if (this.hasCentredOnAPlace) {
			this.panMapTo(coordinates);
		}
		this.coordinates.set(coordinates);
	}

	private centreOnFirstPlace(coordinates: Coordinates | null): void {
		if (
			!coordinates ||
			!namesAPlaceOnEarth(coordinates) ||
			this.hasCentredOnAPlace
		) {
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
			this.mapOptions = {
				...this.mapOptions,
				center: toLatLngLiteral(coordinates),
			};
			return;
		}
		this.map.panTo(toLatLngLiteral(coordinates));
	}
}
