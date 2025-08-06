import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppsRoutingModule } from '@shares/shares.routes';
import { SharesComponent } from '@shares/components/shares/shares.component';
import { SharedModule } from '@shared/shared.module';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule,
		AppsRoutingModule,
		FileBrowserComponentsModule,
	],
	declarations: [SharesComponent],
	providers: [],
})
export class SharesModule {}
