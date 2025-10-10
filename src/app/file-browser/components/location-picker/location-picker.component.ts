import {
	Component,
	OnInit,
	Input,
	Optional,
	Inject,
	ElementRef,
	AfterViewInit,
	ViewChild,
	HostListener,
	NgZone,
} from '@angular/core';
import { ItemVO, ArchiveVO, LocnVOData } from '@models';
import { MapInfoWindow, GoogleMap } from '@angular/google-maps';
import { ApiService } from '@shared/services/api/api.service';
import { ngIfFadeInAnimation } from '@shared/animations';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { find } from 'lodash';
import { PrLocationPipe, LocnPipeOutput } from '@shared/pipes/pr-location.pipe';
import { MessageService } from '@shared/services/message/message.service';
import { EditService } from '@core/services/edit/edit.service';
import { ProfileItemVOData } from '@models/profile-item-vo';
import { ProfileService } from '@shared/services/profile/profile.service';

const DEFAULT_ZOOM = 12;
const DEFAULT_CENTER: google.maps.LatLngLiteral = {
	lat: 39.8333333,
	lng: -98.585522,
};

@Component({
	selector: 'pr-location-picker',
	templateUrl: './location-picker.component.html',
	styleUrls: ['./location-picker.component.scss'],
	animations: [ngIfFadeInAnimation],
	standalone: false,
})
export class LocationPickerComponent implements OnInit, AfterViewInit {
	@Input() item: ItemVO;
	@Input() profileItem: ProfileItemVOData;
	@Input() archive: ArchiveVO;

	mapOptions: google.maps.MapOptions = {
		zoom: DEFAULT_ZOOM,
		streetViewControl: false,
		fullscreenControl: false,
		mapTypeControl: false,
		clickableIcons: false,
	};

	zoom = 4;
	center: google.maps.LatLng = new google.maps.LatLng(DEFAULT_CENTER);

	height: string;
	width: string;

	currentLocation: LocnVOData;
	currentLocationLatLng: google.maps.LatLng;
	currentLocationDisplay: LocnPipeOutput;

	hasChanged = false;
	saving = false;

	@ViewChild(GoogleMap) map: GoogleMap;
	@ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
	@ViewChild('mapWrapper') mapWrapperRef: ElementRef;
	@ViewChild('autocompleteInput') autocompleteInputRef: ElementRef;
	autocomplete: google.maps.places.Autocomplete;

	constructor(
		@Optional() @Inject(DIALOG_DATA) public dialogData: any,
		@Optional() private dialogRef: DialogRef,
		private api: ApiService,
		@Optional() private profile: ProfileService,
		private locationPipe: PrLocationPipe,
		private zone: NgZone,
		private message: MessageService,
		private editService: EditService,
	) {
		if (this.dialogData) {
			this.item = this.dialogData.item;
			this.profileItem = this.dialogData.profileItem;
			this.archive = this.dialogData.archive;
		}
	}

	ngOnInit(): void {
		this.checkItemLocation();
	}

	ngAfterViewInit() {
		this.initAutocomplete();
		setTimeout(() => {
			this.setMapDimensions();
		});
	}

	initAutocomplete() {
		this.autocomplete = new google.maps.places.Autocomplete(
			this.autocompleteInputRef.nativeElement,
		);
		this.autocomplete.setFields([
			'name',
			'formatted_address',
			'address_components',
			'geometry',
		]);
		this.autocomplete.addListener('place_changed', () => {
			this.zone.run(() => {
				this.onAutocompletePlaceSelect();
			});
		});
	}

	@HostListener('window:resize', ['$event'])
	setMapDimensions() {
		const height = (this.mapWrapperRef.nativeElement as HTMLElement)
			.clientHeight;
		const width = (this.mapWrapperRef.nativeElement as HTMLElement).clientWidth;

		this.height = `${height}px`;
		this.width = `${width}px`;
	}

	checkItemLocation() {
		if (this.item?.LocnVO) {
			this.setCurrentLocation(this.item.LocnVO);
		} else if (this.profileItem?.LocnVOs?.length) {
			this.setCurrentLocation(this.profileItem.LocnVOs[0]);
		}
	}

	async setCurrentLocationToLatLng(latLng: google.maps.LatLng) {
		this.currentLocation = null;
		const response = await this.api.locn.geomapLatLng(
			latLng.lat(),
			latLng.lng(),
		);
		if (response.isSuccessful) {
			this.setCurrentLocation(response.getLocnVO(), true);
			this.hasChanged = true;
		} else {
			this.message.showError({
				message: 'There was an error in getting the current location.',
			});
		}
	}

	setCurrentLocation(locn: LocnVOData, pan = false) {
		this.currentLocation = locn;
		this.currentLocationLatLng = new google.maps.LatLng({
			lat: Number(locn.latitude),
			lng: Number(locn.longitude),
		});
		this.currentLocationDisplay = this.locationPipe.transform(locn);
		if (pan) {
			this.map.panTo(this.currentLocationLatLng);
		} else {
			this.center = this.currentLocationLatLng;
		}
	}

	async save() {
		if (this.hasChanged) {
			this.saving = true;
			try {
				if (this.profileItem) {
					await this.saveProfileItem();
				} else {
					await this.saveItem();
				}
				this.dialogRef.close();
				this.message.showMessage({
					message: 'Location saved.',
					style: 'success',
				});
			} catch (err) {
				this.message.showError({
					message: 'There was a problem saving the location.',
				});
				throw err;
			} finally {
				this.saving = false;
			}
		} else {
			this.cancel();
		}
	}

	async saveItem() {
		this.item.update({ LocnVO: this.currentLocation });
		await this.editService.updateItems([this.item], ['LocnVO']);
	}

	async saveProfileItem() {
		const response = await this.api.locn.create(this.currentLocation);
		const locnVO = response.getLocnVO();
		if (locnVO.locnId === this.profileItem.locnId1) {
			return true;
		} else {
			const original = this.profileItem.locnId1;
			try {
				this.profileItem.locnId1 = locnVO.locnId;
				await this.profile.saveProfileItem(this.profileItem, ['locnId1']);
				this.profileItem.LocnVOs = [locnVO];
			} catch (err) {
				this.profileItem.locnId1 = original;
				throw err;
			}
		}
	}

	cancel() {
		if (this.dialogRef) {
			this.dialogRef.close();
		}
	}

	onMapClick(event: google.maps.MapMouseEvent) {
		this.setCurrentLocationToLatLng(event.latLng);
	}

	onAutocompletePlaceSelect() {
		const place = this.autocomplete.getPlace();
		const locnForPlace = this.createLocnFromPlace(place);
		this.setCurrentLocation(locnForPlace, true);
		this.hasChanged = true;
	}

	createLocnFromPlace(place: google.maps.places.PlaceResult) {
		const addr = place.address_components;
		const locn: LocnVOData = {
			latitude: place.geometry.location.lat(),
			longitude: place.geometry.location.lng(),
			streetNumber: getComponentName(addr, 'street_number'),
			streetName: getComponentName(addr, 'route'),
			postalCode: getComponentName(addr, 'postal_code'),
			locality: getComponentName(addr, 'locality'),
			adminOneName: getComponentName(addr, 'administrative_area_level_1'),
			adminOneCode: getComponentName(addr, 'administrative_area_level_1', true),
			adminTwoName: getComponentName(addr, 'administrative_area_level_2'),
			adminTwoCode: getComponentName(addr, 'administrative_area_level_2', true),
			country: getComponentName(addr, 'country'),
			countryCode: getComponentName(addr, 'country', true),
		};

		if (!place.name.includes(locn.streetNumber)) {
			locn.displayName = place.name;
		}

		return locn;

		function getComponentName(
			addressComponents: google.maps.GeocoderAddressComponent[],
			type,
			getShortName = true,
		) {
			const component = find(addressComponents, (c) => c.types.includes(type));
			return component
				? component[getShortName ? 'short_name' : 'long_name']
				: null;
		}
	}
}
