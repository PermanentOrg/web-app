import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pr-metadata-creation-form',
  templateUrl: './form-create.component.html',
  styleUrls: ['./form-create.component.scss'],
})
export class FormCreateComponent implements OnInit {
  @Input() public placeholder = '';
  @Input() public submitCallback: (t: string) => Promise<void>;

  public editing = false;
  public waiting = false;
  public newTagName = '';
  constructor() {}

  ngOnInit(): void {}

  public async runSubmitCallback() {
    this.waiting = true;
    try {
      await this.submitCallback(this.newTagName);
      this.editing = false;
    } catch {
      // do nothing
    } finally {
      this.waiting = false;
    }
  }
}
