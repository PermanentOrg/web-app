import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pr-metadata-form-edit',
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss'],
})
export class FormEditComponent implements OnInit {
  @Input() public displayName: string;
  @Input() public delete: () => Promise<void>;
  @Input() public save: (newName: string) => Promise<void>;
  public menuOpen = false;
  public editing = false;
  public waiting = false;
  public newValueName = '';

  constructor() {}

  ngOnInit(): void {}

  public openEditor(): void {
    this.editing = true;
    this.menuOpen = false;
  }

  public async saveTag() {
    if (this.waiting) {
      return;
    }
    this.waiting = true;
    try {
      await this.save(this.newValueName);
      this.editing = false;
    } catch {
      // Do nothing
    } finally {
      this.waiting = false;
    }
  }

  public async deleteTag() {
    this.menuOpen = false;
    if (this.waiting) {
      return;
    }
    this.waiting = true;
    await this.delete();
    this.waiting = false;
  }
}
