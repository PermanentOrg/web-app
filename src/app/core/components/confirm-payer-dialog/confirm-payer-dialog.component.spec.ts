/* @format */
import {
  ComponentFixture,
  TestBed,
  TestModuleMetadata,
} from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { cloneDeep } from 'lodash';
import { SharedModule } from '../../../shared/shared.module';
import { ConfirmPayerDialogComponent } from './confirm-payer-dialog.component';

class MockDialogRef {
  close() {}
}

describe('ConfirmPayerDialogComponent', () => {
  let component: ConfirmPayerDialogComponent;
  let fixture: ComponentFixture<ConfirmPayerDialogComponent>;
  let dialogRef: DialogRef;
  let dialogData: {
    archiveId: number;
    isPayerDifferentThanLoggedUser: boolean;
    handleAccountInfoChange: () => void;
    cancelAccountPayerSet: () => void;
  };

  beforeEach(async () => {
    const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

    dialogData = {
      archiveId: 1,
      isPayerDifferentThanLoggedUser: false,
      handleAccountInfoChange: () => {},
      cancelAccountPayerSet: () => {},
    };

    config.imports.push(SharedModule);
    config.declarations.push(ConfirmPayerDialogComponent);
    config.providers.push({
      provide: DIALOG_DATA,
      useValue: {
        sharerName: 'John Rando',
      },
    });
    config.providers.push({
      provide: DialogRef,
      useClass: MockDialogRef,
    });
    await TestBed.configureTestingModule(config).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPayerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
