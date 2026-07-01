import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AccountVO } from '../../../models/account-vo';

@Component({
	selector: 'pr-archive-storage-payer',
	templateUrl: './archive-storage-payer.component.html',
	styleUrls: ['./archive-storage-payer.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class ArchiveStoragePayerComponent {
	@Input() payer: AccountVO;
}
