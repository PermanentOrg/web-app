import { Injectable } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { EditDateTimeModalComponent } from './edit-date-time-modal.component';
import { EditDateModel } from './edit-date-time.model';

@Injectable({
	providedIn: 'root',
})
export class EditDateTimeModalService {
	constructor(private dialogCdkService: DialogCdkService) {}

	open(
		data: EditDateModel,
	): DialogRef<EditDateModel, EditDateTimeModalComponent> {
		return this.dialogCdkService.open<
			EditDateTimeModalComponent,
			EditDateModel,
			EditDateModel
		>(EditDateTimeModalComponent, {
			data,
			hasBackdrop: true,
			panelClass: 'edit-date-time-modal-dialog-panel',
		});
	}
}
