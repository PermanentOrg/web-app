import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { DialogCdkService } from './dialog-cdk.service';

@Component({
  selector: 'pr-dummy',
  standalone: true,
  imports: [],
  template: 'Hello world',
})
class DummyComponent {}

describe('DialogCdkService', () => {
  let service: DialogCdkService;
  let dialog: Dialog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogCdkService);
    dialog = TestBed.inject(Dialog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('it wraps around Angular CDK dialog.open', () => {
    const open = spyOn(dialog, 'open').and.stub();
    const config = {
      width: '640px',
      height: '480px',
      panelClass: 'test-dialog',
    };
    service.open(DummyComponent, config);

    expect(open).toHaveBeenCalledWith(DummyComponent, config);
  });
});
