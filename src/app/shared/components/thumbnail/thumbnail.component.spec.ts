import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailComponent } from '@shared/components/thumbnail/thumbnail.component';
import { RecordVO } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';

const baseImageUrl = 'https://via.placeholder.com';

const image200 = `${baseImageUrl}/200`;
const image500 = `${baseImageUrl}/500`;
const image1000 = `${baseImageUrl}/1000`;
const image2000 = `${baseImageUrl}/2000`;

function addParam(url, param) {
  return `${url}?text=${param}`;
}

const minItem = new RecordVO({ folder_linkId: 1 }, false, DataStatus.Placeholder);
const leanItem = new RecordVO({folder_linkId: 1, thumbURL200: image200 }, false, DataStatus.Lean);
const fullItem = new RecordVO(
    {
      folder_linkId: 1,
      thumbURL200: image200,
      thumbURL500: image500,
      thumbURL1000: image1000,
      type: 'type.record.image'
    },
    false,
    DataStatus.Full
  );

const minItem2 = new RecordVO(
    {
      folder_linkId: 2,
    },
    false,
    DataStatus.Placeholder
  );
const leanItem2 = new RecordVO(
    {
      folder_linkId: 2,
      thumbURL200: addParam(image200, 'item2')
    },
    false,
    DataStatus.Lean
  );
const fullItem2 = new RecordVO(
    {
      folder_linkId: 2,
      thumbURL200: addParam(image200, 'item2'),
      thumbURL500: addParam(image500, 'item2'),
      thumbURL1000: addParam(image500, 'item2')
    },
    false,
    DataStatus.Full
  );

@Component({
  selector: `pr-test-host-component`,
  template: `<pr-thumbnail [item]='item' [style.width]="size" [style.height]="size"></pr-thumbnail>`,
  styles: [`
  pr-thumbnail {
    display: block;
    width: 0px;
    height: 0px;
  }
  `]
})
class TestHostComponent {
  @ViewChild(ThumbnailComponent) public component: ThumbnailComponent;
  public item: RecordVO = new RecordVO(minItem);
  public size = '200px';
}

describe('ThumbnailComponent', () => {
  let component: ThumbnailComponent;
  let hostComponent: TestHostComponent;

  let fixture: ComponentFixture<TestHostComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailComponent, TestHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = hostComponent.component;
  });

  it('should create host component', () => {
    expect(hostComponent).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should use image 200 if item is lean at any DPI and width', async () => {
    hostComponent.item.update(leanItem);
    hostComponent.item.dataStatus = leanItem.dataStatus;
    fixture.detectChanges();
    expect(component['currentThumbUrl']).toEqual(image200);
  });

  it('should use image 200 for low DPI at width 100', async () => {
    hostComponent.size = '100px';
    component['dpiScale'] = 1;
    fixture.detectChanges();

    hostComponent.item.update(fullItem);
    hostComponent.item.dataStatus = fullItem.dataStatus;
    fixture.detectChanges();
    expect(component['targetThumbWidth']).toEqual(200);
    expect(component['currentThumbUrl']).toEqual(image200);
  });

  it('should use image 200 for high DPI at width 100', async () => {
    hostComponent.size = '100px';
    component['dpiScale'] = 2;
    fixture.detectChanges();

    hostComponent.item.update(fullItem);
    hostComponent.item.dataStatus = fullItem.dataStatus;
    fixture.detectChanges();
    expect(component['targetThumbWidth']).toEqual(200);
    expect(component['currentThumbUrl']).toEqual(image200);
  });

  it('should use image 200 for low DPI at width 200', async () => {
    hostComponent.size = '200px';
    component['dpiScale'] = 1;
    fixture.detectChanges();

    hostComponent.item.update(fullItem);
    hostComponent.item.dataStatus = fullItem.dataStatus;
    fixture.detectChanges();
    expect(component['targetThumbWidth']).toEqual(200);
    expect(component['currentThumbUrl']).toEqual(image200);
  });

  it('should use image 500 for high DPI at width 200', async () => {
    component['dpiScale'] = 2;

    hostComponent.item.update(fullItem);
    hostComponent.item.dataStatus = fullItem.dataStatus;
    fixture.detectChanges();
    expect(component['targetThumbWidth']).toEqual(500);
    expect(component['currentThumbUrl']).toEqual(image500);
  });

  it('should use reset when changing records', async () => {
    component['dpiScale'] = 2;

    hostComponent.item.update(fullItem);
    hostComponent.item.dataStatus = fullItem.dataStatus;
    fixture.detectChanges();
    expect(component['targetThumbWidth']).toEqual(500);
    expect(component['currentThumbUrl']).toEqual(image500);

    hostComponent.item = fullItem2;
    fixture.detectChanges();
    expect(component['targetThumbWidth']).toEqual(500);
    expect(component['currentThumbUrl']).toEqual(fullItem2.thumbURL500);
  });

  it('should show a zip icon if the item is a .zip archive', async () => {
    component['dpiScale'] = 2;

    hostComponent.item.update(fullItem);
    hostComponent.item.type = 'type.record.archive';
    hostComponent.item.dataStatus = fullItem.dataStatus;
    fixture.detectChanges();
    expect(component['element'].querySelector('fa-icon')).not.toBeNull();
    expect(component['element'].querySelector('.pr-thumbnail-image:not([hidden])')).toBeNull();
  });
});
