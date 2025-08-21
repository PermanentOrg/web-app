import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
	selector: 'pr-confirm-gift-dialog',
	templateUrl: './confirm-gift-dialog.component.html',
	styleUrls: ['./confirm-gift-dialog.component.scss'],
	standalone: false,
})
export class ConfirmGiftDialogComponent {
	constructor(
		private dialogRef: DialogRef,
		@Inject(DIALOG_DATA) public data: any,
	) {}

	public onDoneClick(): void {
		this.dialogRef.close();
	}

	public async onConfirmClick() {
		this.dialogRef.close(true);
	}
}
