import {
	Component,
	ElementRef,
	HostListener,
	computed,
	effect,
	inject,
	input,
	output,
	signal,
	viewChild,
} from '@angular/core';
import {
	TimezoneGroup,
	TimezoneOption,
	TimezoneService,
} from '@shared/services/timezone-service/timezone.service';

export const TIMEZONE_PLACEHOLDER = 'Select timezone';
export const NO_MATCHES_MESSAGE = 'No matching timezones';

export interface IndexedTimezoneOption {
	option: TimezoneOption;
	index: number;
}

export interface IndexedTimezoneGroup {
	region: string;
	options: IndexedTimezoneOption[];
}

/** Stands for "no timezone" so clearing is reachable by mouse and keyboard
 * alike; an empty identifier is what marks it apart from a real zone. */
const CLEAR_OPTION: TimezoneOption = {
	timezoneId: '',
	offsetLabel: '',
	region: '',
	countryName: '',
	searchText: '',
};

let instanceCount = 0;

@Component({
	selector: 'pr-timezone-dropdown',
	standalone: true,
	templateUrl: './timezone-dropdown.component.html',
	styleUrls: ['./timezone-dropdown.component.scss'],
})
export class TimezoneDropdownComponent {
	readonly selectedTimezone = input<unknown>(undefined);
	readonly disabled = input(false);
	readonly showSearch = input(false);
	readonly fieldLabel = input('Timezone');

	readonly timezoneChange = output<string | null>();

	private readonly triggerButton =
		viewChild<ElementRef<HTMLButtonElement>>('triggerButton');
	private readonly searchInput =
		viewChild<ElementRef<HTMLInputElement>>('searchInput');

	readonly isOpen = signal(false);
	readonly searchTerm = signal('');
	readonly activeOptionIndex = signal(0);

	readonly placeholder = TIMEZONE_PLACEHOLDER;
	readonly noMatchesMessage = NO_MATCHES_MESSAGE;
	readonly elementIdPrefix = `pr-timezone-dropdown-${(instanceCount += 1)}`;
	readonly listboxElementId = `${this.elementIdPrefix}-listbox`;

	private readonly timezoneService = inject(TimezoneService);
	private readonly elementRef = inject(ElementRef);

	readonly selectedOption = computed<TimezoneOption | null>(() =>
		this.timezoneService.getOption(this.selectedTimezone()),
	);

	readonly groups = computed<TimezoneGroup[]>(() => {
		const searchTerm = this.searchTerm().trim().toLowerCase();
		if (!searchTerm) {
			return this.selectableGroups();
		}
		return this.selectableGroups()
			.map((group) => ({
				region: group.region,
				options: group.options.filter((option) =>
					option.searchText.includes(searchTerm),
				),
			}))
			.filter((group) => group.options.length > 0);
	});

	/** Hidden while searching so the first arrow-down lands on a match rather
	 * than on the clear row. */
	readonly showClearOption = computed(() => !this.searchTerm().trim());

	readonly clearOption = CLEAR_OPTION;

	readonly visibleOptions = computed<TimezoneOption[]>(() => {
		const options = this.groups().flatMap((group) => group.options);
		return this.showClearOption() ? [CLEAR_OPTION, ...options] : options;
	});

	/**
	 * Each option carries its position in the flattened list so the template can
	 * bind element ids and the active row without searching the list per option.
	 */
	readonly indexedGroups = computed<IndexedTimezoneGroup[]>(() => {
		let nextOptionIndex = this.showClearOption() ? 1 : 0;
		return this.groups().map((group) => ({
			region: group.region,
			options: group.options.map((option) => {
				const index = nextOptionIndex;
				nextOptionIndex += 1;
				return { option, index };
			}),
		}));
	});

	readonly activeOption = computed<TimezoneOption | null>(
		() => this.visibleOptions()[this.clampedActiveOptionIndex()] ?? null,
	);

	readonly activeDescendantId = computed<string | null>(() =>
		this.isOpen() && this.activeOption()
			? this.buildOptionElementId(this.clampedActiveOptionIndex())
			: null,
	);

	/**
	 * Intl.supportedValuesOf omits identifiers it still accepts elsewhere, so a
	 * selection missing from the list is folded in rather than left unselectable.
	 */
	private readonly selectableGroups = computed<TimezoneGroup[]>(() => {
		const groups = this.timezoneService.getGroupedOptions();
		const selectedOption = this.selectedOption();
		const isListed =
			!selectedOption ||
			groups.some((group) =>
				group.options.some(
					(option) => option.timezoneId === selectedOption.timezoneId,
				),
			);
		if (isListed) {
			return groups;
		}
		return groups.some((group) => group.region === selectedOption.region)
			? groups.map((group) =>
					group.region === selectedOption.region
						? { ...group, options: [selectedOption, ...group.options] }
						: group,
				)
			: [
					{ region: selectedOption.region, options: [selectedOption] },
					...groups,
				];
	});

	constructor() {
		// The search field only exists once the panel has rendered, so focus has
		// to wait for the view child rather than move inside open().
		effect(() => {
			if (this.isOpen() && this.showSearch()) {
				this.searchInput()?.nativeElement.focus();
			}
		});
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		const target = event.target as Node;
		if (
			this.isOpen() &&
			target.isConnected &&
			!this.elementRef.nativeElement.contains(target)
		) {
			this.close();
		}
	}

	isOptionActive(optionIndex: number): boolean {
		return this.isOpen() && optionIndex === this.clampedActiveOptionIndex();
	}

	isOptionSelected(option: TimezoneOption): boolean {
		return option.timezoneId === (this.selectedOption()?.timezoneId ?? '');
	}

	buildOptionElementId(optionIndex: number): string {
		return `${this.elementIdPrefix}-option-${optionIndex}`;
	}

	buildRegionElementId(region: string): string {
		return `${this.elementIdPrefix}-region-${region.replace(/\s+/g, '-')}`;
	}

	toggle(): void {
		if (this.disabled()) {
			return;
		}
		if (this.isOpen()) {
			this.close();
		} else {
			this.open();
		}
	}

	open(): void {
		if (this.disabled()) {
			return;
		}
		this.searchTerm.set('');
		this.activeOptionIndex.set(Math.max(0, this.indexOfSelectedOption()));
		this.isOpen.set(true);
	}

	close(): void {
		this.isOpen.set(false);
		this.searchTerm.set('');
	}

	closeAndRefocusTrigger(): void {
		this.close();
		this.triggerButton()?.nativeElement.focus();
	}

	onSearchTermChange(searchTerm: string): void {
		this.searchTerm.set(searchTerm);
		this.activeOptionIndex.set(0);
	}

	selectOption(option: TimezoneOption): void {
		this.timezoneChange.emit(option.timezoneId || null);
		this.closeAndRefocusTrigger();
	}

	onKeydown(event: KeyboardEvent): void {
		if (this.disabled()) {
			return;
		}

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				this.isOpen() ? this.moveActiveOption(1) : this.open();
				break;
			case 'ArrowUp':
				event.preventDefault();
				this.isOpen() ? this.moveActiveOption(-1) : this.open();
				break;
			case 'Home':
				if (this.isOpen()) {
					event.preventDefault();
					this.setActiveOptionIndex(0);
				}
				break;
			case 'End':
				if (this.isOpen()) {
					event.preventDefault();
					this.setActiveOptionIndex(this.visibleOptions().length - 1);
				}
				break;
			case 'Enter':
				event.preventDefault();
				this.isOpen() ? this.selectActiveOption() : this.open();
				break;
			case ' ':
				// While the search field has focus a space has to reach the input.
				if (!this.showSearch() || !this.isOpen()) {
					event.preventDefault();
					this.isOpen() ? this.selectActiveOption() : this.open();
				}
				break;
			case 'Escape':
				if (this.isOpen()) {
					event.preventDefault();
					this.closeAndRefocusTrigger();
				}
				break;
			// Tab closes the panel but must still move focus, so it is not
			// prevented.
			case 'Tab':
				this.close();
				break;
			default:
				break;
		}
	}

	private selectActiveOption(): void {
		const activeOption = this.activeOption();
		if (activeOption) {
			this.selectOption(activeOption);
		} else {
			this.closeAndRefocusTrigger();
		}
	}

	private moveActiveOption(step: number): void {
		const optionCount = this.visibleOptions().length;
		if (!optionCount) {
			return;
		}
		const nextIndex =
			(this.clampedActiveOptionIndex() + step + optionCount) % optionCount;
		this.setActiveOptionIndex(nextIndex);
	}

	private setActiveOptionIndex(optionIndex: number): void {
		if (optionIndex < 0) {
			return;
		}
		this.activeOptionIndex.set(optionIndex);
		this.scrollActiveOptionIntoView(optionIndex);
	}

	private clampedActiveOptionIndex(): number {
		const optionCount = this.visibleOptions().length;
		if (!optionCount) {
			return -1;
		}
		return Math.min(this.activeOptionIndex(), optionCount - 1);
	}

	private indexOfSelectedOption(): number {
		const selectedOption = this.selectedOption();
		return selectedOption
			? this.visibleOptions().findIndex(
					(option) => option.timezoneId === selectedOption.timezoneId,
				)
			: -1;
	}

	// Every option stays in the DOM while the panel is open, so the row can be
	// looked up and scrolled without waiting for another render pass.
	private scrollActiveOptionIntoView(optionIndex: number): void {
		const optionElement = (
			this.elementRef.nativeElement as HTMLElement
		).querySelector(`#${this.buildOptionElementId(optionIndex)}`);
		optionElement?.scrollIntoView({ block: 'nearest' });
	}
}
