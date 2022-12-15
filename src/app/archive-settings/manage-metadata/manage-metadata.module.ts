import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { ManageCustomMetadataComponent } from './manage-custom-metadata/manage-custom-metadata.component';
import { MetadataValuePipe } from './pipes/metadata-value.pipe';
import { AddNewValueComponent } from './add-new-value/add-new-value.component';
import { FormsModule } from '@angular/forms';
import { EditValueComponent } from './edit-value/edit-value.component';
import { CreationFormComponent } from './creation-form/creation-form.component';
import { AddNewCategoryComponent } from './add-new-category/add-new-category.component';

@NgModule({
  declarations: [
    ManageCustomMetadataComponent,
    MetadataValuePipe,
    AddNewValueComponent,
    EditValueComponent,
    CreationFormComponent,
    AddNewCategoryComponent,
  ],
  imports: [CommonModule, SharedModule, FormsModule],
  exports: [ManageCustomMetadataComponent],
})
export class ManageMetadataModule {}
