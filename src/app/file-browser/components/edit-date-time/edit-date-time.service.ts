import { Injectable } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { EditDateTimeComponent } from './edit-date-time.component';
import { EditDateModel } from './edit-date-time.model';

@Injectable({
	providedIn: 'root',
})
export class EditDateTimeService {
	constructor(private dialogCdkService: DialogCdkService) {}

	open(data: EditDateModel): DialogRef<EditDateModel, EditDateTimeComponent> {
		return this.dialogCdkService.open<
			EditDateTimeComponent,
			EditDateModel,
			EditDateModel
		>(EditDateTimeComponent, {
			data,
			hasBackdrop: true,
			panelClass: 'edit-date-time-dialog-panel',
		});
	}
}
