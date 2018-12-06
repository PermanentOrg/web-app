import { Component, NgModule, ApplicationRef } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';
import { Dialog } from './dialog.service';

@Component({
  selector: 'app-root',
  template: ''
})
class MockAppComponent {
  constructor() {
  }
}

@NgModule({
  declarations: [
    MockAppComponent
  ]
})
class MockAppModule {
  constructor() {
  }
}

describe('Dialog', () => {
  beforeEach(async() => {
    TestBed.configureTestingModule({
      imports: [MockAppModule],
      providers: [Dialog],
    });
  });

  beforeEach(() => {
    const appRef = TestBed.get(ApplicationRef) as ApplicationRef;
    const fixture = TestBed.createComponent(MockAppComponent);
    appRef.components.push(fixture.componentRef);
  });


  it('should be created', inject([Dialog], (service: Dialog) => {
    expect(service).toBeTruthy();
  }));
});
