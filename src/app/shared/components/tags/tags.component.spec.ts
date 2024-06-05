/* @format */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TagsComponent } from './tags.component';

describe('TagsComponent', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TagsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [TagsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create tagType and tagValue elements', () => {
    const tags = [{ name: 'type:value' }];
    component.tags = tags;
    component.ngOnChanges();
    fixture.detectChanges();

    const debugTypeElement = fixture.debugElement.query(
      By.css('.customMetadataField'),
    );

    expect(debugTypeElement).toBeTruthy();

    const debugValueElement = fixture.debugElement.query(
      By.css('.customMetadataValue'),
    );

    expect(debugValueElement).toBeTruthy();
  });

  it('should display the add tags button even if there are tags selected', () => {
    const tags = [{ name: 'type:value' }];
    component.isEditing = false;
    component.tags = tags;
    component.canEdit = true;
    component.ngOnChanges();
    fixture.detectChanges();
    const addTags = fixture.debugElement.query(By.css('.not-empty'));

    expect(addTags).toBeTruthy();
  });

  it('should display the "Click to add" text when in fullscreen view', () => {
    const tags = [];
    component.tags = tags;
    component.canEdit = true;
    component.ngOnChanges();
    fixture.detectChanges();
    const div = fixture.debugElement.query(By.css('.empty'));

    expect(div.nativeElement.textContent.trim()).toBe('Click to add');
  });

  it('should display the "No tags" text when in fullscreen view, but on the public archive', () => {
    const tags = [];
    component.tags = tags;
    component.canEdit = false;
    component.ngOnChanges();
    fixture.detectChanges();
    const div = fixture.debugElement.query(By.css('.empty'));

    expect(div.nativeElement.textContent.trim()).toBe('No tags');
  });
});
