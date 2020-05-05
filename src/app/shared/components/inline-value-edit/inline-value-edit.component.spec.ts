import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { InlineValueEditComponent } from './inline-value-edit.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

describe('InlineValueEditComponent', () => {
  let component: InlineValueEditComponent;
  let fixture: ComponentFixture<InlineValueEditComponent>;

  const TEST_TEXT = 'Test Name';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineValueEditComponent ],
      imports: [ FormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineValueEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initalize input with given value when editing starts', () => {
    component.displayValue = TEST_TEXT;
    component.startEdit();

    expect(component.editValue).toEqual(TEST_TEXT);
  });

  it('should start editing with click', fakeAsync(() => {
    const displayElement = fixture.debugElement.query(By.css('.inline-value-display'));
    displayElement.triggerEventHandler('click', null);
    expect(component.isEditing).toBeTruthy();
  }));

  it('should focus input when starting edit', () => {
    component.displayValue = TEST_TEXT;
    component.startEdit();
    const inputElement = fixture.debugElement.query(By.css('input'));
    expect(document.activeElement).toBe(inputElement.nativeElement);
  });

  it('should emit final value when finishing edit', () => {
    component.displayValue = TEST_TEXT;
    component.startEdit();

    let doneValue;

    component.doneEditing.subscribe((value) => {
      doneValue = value;
    });

    component.editValue = 'i have changed it...';

    component.endEdit();

    expect(doneValue).toEqual(component.editValue);
  });

  it('should end editing on blur', async () => {
    component.displayValue = TEST_TEXT;
    component.startEdit();
    expect(component.isEditing).toBeTruthy();

    const inputElement = fixture.debugElement.query(By.css('input'));
    inputElement.triggerEventHandler('blur', null);
    fixture.detectChanges();
    expect(component.isEditing).toBeFalsy();
  });
});
