import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';
import { AnnouncementComponent } from './components/announcement/announcement.component';
import { AndroidAppNotifyComponent } from './components/android-app-notify/android-app-notify.component';


@NgModule({
  declarations: [AnnouncementComponent, AndroidAppNotifyComponent],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    AnnouncementComponent,
    AndroidAppNotifyComponent,
  ]
})
export class AnnouncementModule {
  constructor(
    private library: FaIconLibrary,
  ) {
    library.addIcons(faWindowClose);
  }
}
