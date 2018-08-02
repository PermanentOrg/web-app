import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorComponent } from '@apps/components/connector/connector.component';

describe('ConnectorComponent', () => {
  let component: ConnectorComponent;
  let fixture: ComponentFixture<ConnectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
