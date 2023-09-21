/* @format */
import { Shallow } from 'shallow-render';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryComponent } from './gallery.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [], // components your module owns.
  imports: [], // other modules your module needs.
  providers: [], // providers available to your module.
  bootstrap: [], // bootstrap this root component.
})
class DummyModule {}

fdescribe('GalleryComponent', () => {
  let shallow: Shallow<GalleryComponent>;
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;

  it('should create', async () => {
    shallow = new Shallow(GalleryComponent, DummyModule);
    const rendering = await shallow.render();
    component = rendering.instance;
    expect(component).toBeTruthy();
  });
});
