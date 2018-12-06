import { Component, OnInit, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@root/app/dialog/dialog.service';

@Component({
  selector: 'pr-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss']
})
export class SharingComponent implements OnInit {

  constructor(@Inject(DIALOG_DATA) public data: any, private dialogRef: DialogRef) { }

  ngOnInit() {
    console.log(this.data);
    console.log(this.dialogRef);
  }

}
