/* @format */
import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import { cloneDeep } from 'lodash';

import { SharedModule } from '@shared/shared.module';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import * as Testing from '@root/test/testbedConfig';
import { InviteVO } from '@root/app/models';
import { CreateAccountDialogComponent } from './create-account-dialog.component';

describe('CreateAccountDialogComponent', () => {
  let component: CreateAccountDialogComponent;
  let fixture: ComponentFixture<CreateAccountDialogComponent>;
  let dialogData: { sharerName: string };
  let dialogRef: DialogRef;

  beforeEach(async () => {
    const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

    dialogData = {
      sharerName: 'John Rando',
    };

    dialogRef = new DialogRef(1, null);

    config.imports.push(SharedModule);
    config.declarations.push(CreateAccountDialogComponent);
    config.providers.push({
      provide: DIALOG_DATA,
      useValue: {
        sharerName: 'John Rando',
      },
    });
    config.providers.push({
      provide: DialogRef,
      useValue: dialogRef,
    });
    await TestBed.configureTestingModule(config).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should should take sharerName from the dialog data', () => {
    expect(component.sharerName).toEqual('John Rando');
  });

  it('should close when close method is called', () => {
    const dialogRefSpy = spyOn(dialogRef, 'close');

    component.close();

    expect(dialogRefSpy).toHaveBeenCalled();
  });
});
