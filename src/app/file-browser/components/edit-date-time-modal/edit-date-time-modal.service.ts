import { Injectable } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { EditDateTimeModalComponent } from './edit-date-time-modal.component';
import { DateTimeModel } from '@shared/services/edtf-service/edtf.service';

@Injectable({
	providedIn: 'root',
})
export class EditDateTimeModalService {
	constructor(private dialogCdkService: DialogCdkService) {}

	open(
		data: DateTimeModel,
	): DialogRef<DateTimeModel, EditDateTimeModalComponent> {
		return this.dialogCdkService.open<
			EditDateTimeModalComponent,
			DateTimeModel,
			DateTimeModel
		>(EditDateTimeModalComponent, {
			data,
			hasBackdrop: true,
			panelClass: 'edit-date-time-modal-dialog-panel',
		});
	}
}
