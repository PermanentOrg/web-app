import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { FilesystemService } from './filesystem.service';
import { FilesystemApiService } from './filesystem-api.service';

@NgModule({
	declarations: [],
	imports: [CommonModule, SharedModule],
	providers: [FilesystemService, FilesystemApiService],
})
export class FilesystemModule {}
