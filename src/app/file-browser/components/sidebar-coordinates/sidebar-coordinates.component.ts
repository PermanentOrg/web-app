import {
	Component,
	computed,
	effect,
	ElementRef,
	input,
	output,
	signal,
	viewChild,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
	faArrowTurnDownLeft,
	faLocationCrosshairs,
	faPenToSquare,
	faPlus,
} from '@fortawesome/pro-regular-svg-icons';
import { LocnVOData } from '@models';
import {
	Coordinates,
	coordinatesFromLocation,
	formatCoordinates,
	parseCoordinates,
} from '@shared/utilities/coordinates';

@Component({
	selector: 'pr-sidebar-coordinates',
	standalone: true,
	imports: [FontAwesomeModule],
	templateUrl: './sidebar-coordinates.component.html',
	styleUrls: ['./sidebar-coordinates.component.scss'],
})
export class SidebarCoordinatesComponent {
	location = input<LocnVOData | null>(null);
	canEdit = input(false);

	coordinatesChange = output<Coordinates | null>();
	mapRequested = output<void>();

	readonly editIcon = faPenToSquare;
	readonly addIcon = faPlus;
	readonly mapIcon = faLocationCrosshairs;
	readonly submitIcon = faArrowTurnDownLeft;

	isEditing = signal(false);
	draft = signal('');

	private draftInput = viewChild<ElementRef<HTMLInputElement>>('draftInput');

	storedCoordinates = computed(() => coordinatesFromLocation(this.location()));

	formattedCoordinates = computed(() => {
		const coordinates = this.storedCoordinates();
		return coordinates ? formatCoordinates(coordinates) : null;
	});

	isDraftEmpty = computed(() => this.draft().trim() === '');

	draftCoordinates = computed(() => parseCoordinates(this.draft()));

	isDraftValid = computed(
		() => this.isDraftEmpty() || this.draftCoordinates() !== null,
	);

	constructor() {
		effect(() => this.draftInput()?.nativeElement.focus());
	}

	public startEditing(): void {
		this.draft.set(this.formattedCoordinates() ?? '');
		this.isEditing.set(true);
	}

	public cancel(): void {
		this.isEditing.set(false);
	}

	public onDraftInput(event: Event): void {
		this.draft.set((event.target as HTMLInputElement).value);
	}

	public submit(): void {
		if (!this.isDraftValid()) {
			return;
		}
		const isUnchanged =
			this.draft().trim() === (this.formattedCoordinates() ?? '');
		if (!isUnchanged) {
			this.coordinatesChange.emit(this.draftCoordinates());
		}
		this.isEditing.set(false);
	}

	public chooseOnMap(): void {
		this.isEditing.set(false);
		this.mapRequested.emit();
	}
}
