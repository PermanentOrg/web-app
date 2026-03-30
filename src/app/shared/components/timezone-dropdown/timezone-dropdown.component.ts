import {
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	computed,
	ElementRef,
	ViewChild,
	HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	TimezoneOption,
	TIMEZONES,
} from '@shared/services/edtf-service/edtf.service';

@Component({
	selector: 'pr-timezone-dropdown',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './timezone-dropdown.component.html',
	styleUrls: ['./timezone-dropdown.component.scss'],
})
export class TimezoneDropdownComponent {
	@Input() selectedOffset = '';
	@Input() selectedName = '';
	@Input() disabled = false;
	@Output() timezoneChange = new EventEmitter<TimezoneOption>();

	@ViewChild('dropdownContainer') dropdownContainer?: ElementRef<HTMLElement>;

	isOpen = signal(false);
	filter = signal('');

	timezones = TIMEZONES;

	filteredTimezones = computed(() => {
		const term = this.filter().toLowerCase();
		if (!term) return this.timezones;
		return this.timezones.filter(
			(tz) =>
				tz.name.toLowerCase().includes(term) ||
				tz.offset.toLowerCase().includes(term),
		);
	});

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		const target = event.target as Node;
		if (!this.dropdownContainer?.nativeElement.contains(target)) {
			this.close();
		}
	}

	toggle(): void {
		if (this.disabled) return;
		if (this.isOpen()) {
			this.close();
		} else {
			this.isOpen.set(true);
			this.filter.set('');
		}
	}

	close(): void {
		this.isOpen.set(false);
		this.filter.set('');
	}

	select(tz: TimezoneOption): void {
		this.timezoneChange.emit(tz);
		this.close();
	}
}
