/* @format */
import { Shallow } from 'shallow-render';
import { CoreModule } from '@core/core.module';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';
import { EventService } from '@shared/services/event/event.service';
import { StorageDialogComponent } from './storage-dialog.component';

class MockDialogRef {
  close(_?: any): void {
    // Mock close method
  }
}

describe('StorageDialogComponent', () => {
  let shallow: Shallow<StorageDialogComponent>;
  let mockActivatedRoute;
  const paramMap = new BehaviorSubject(convertToParamMap({}));
  const queryParamMap = new BehaviorSubject(convertToParamMap({}));

  beforeEach(() => {
    mockActivatedRoute = {
      paramMap: paramMap.asObservable(),
      queryParamMap: queryParamMap.asObservable(),
      snapshot: { fragment: null },
    };
    shallow = new Shallow(StorageDialogComponent, CoreModule)
      .provideMock({ provide: DialogRef, useClass: MockDialogRef })
      .provideMock([{ provide: ActivatedRoute, useValue: mockActivatedRoute }]);
  });

  it('should exist', async () => {
    const { element } = await shallow.render();

    expect(element).not.toBeNull();
  });

  it('should set the tab if the URL fragment matches a tab', async () => {
    mockActivatedRoute.snapshot.fragment = 'promo';
    const { instance } = await shallow.render();

    expect(instance.activeTab).toBe('promo');
  });

  it('should not set the tab if the URL fragment is invalid', async () => {
    mockActivatedRoute.snapshot.fragment = 'not-a-real-tab';
    const { instance } = await shallow.render();

    expect(instance.activeTab).not.toBe(mockActivatedRoute.snapshot.fragment);
  });

  it('can close the dialog', async () => {
    const { instance, inject } = await shallow.render();
    const spy = spyOn(inject(DialogRef), 'close');
    instance.onDoneClick();

    expect(spy).toHaveBeenCalled();
  });

  it('should emit an event when the promo tab is selected', async () => {
    const { fixture, instance, inject } = await shallow.render();
    let eventCalled = false;
    inject(EventService).addObserver({
      async update() {
        eventCalled = true;
      },
    });
    instance.setTab('promo');
    await fixture.whenStable();

    expect(eventCalled).toBeTrue();
  });
});
