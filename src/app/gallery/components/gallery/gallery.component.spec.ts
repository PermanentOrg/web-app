/* @format */
import { Shallow } from 'shallow-render';

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

  beforeEach(async () => {
    shallow = new Shallow(GalleryComponent, DummyModule);
    component = (await shallow.render()).instance;
  });

  it('should be able to get a list of featured archives', async () => {
    expect(component.getFeaturedArchives()).toBeTruthy();
  });
});
