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
      By.css('.customMetadataField')
    );
    expect(debugTypeElement).toBeTruthy();

    const debugValueElement = fixture.debugElement.query(
      By.css('.customMetadataValue')
    );
    expect(debugValueElement).toBeTruthy();
  });
});
