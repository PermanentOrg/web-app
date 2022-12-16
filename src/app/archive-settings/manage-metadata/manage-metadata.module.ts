import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { ManageCustomMetadataComponent } from './manage-custom-metadata/manage-custom-metadata.component';
import { MetadataValuePipe } from './pipes/metadata-value.pipe';
import { AddNewValueComponent } from './subcomponents/value-add/add-new-value.component';
import { FormsModule } from '@angular/forms';
import { EditValueComponent } from './subcomponents/value-edit/value-edit.component';
import { FormCreateComponent } from './subcomponents/form-create/form-create.component';
import { AddNewCategoryComponent } from './subcomponents/category-add/add-new-category.component';
import { FormEditComponent } from './subcomponents/form-edit/form-edit.component';

@NgModule({
  declarations: [
    ManageCustomMetadataComponent,
    MetadataValuePipe,
    AddNewValueComponent,
    EditValueComponent,
    FormCreateComponent,
    AddNewCategoryComponent,
    FormEditComponent,
  ],
  imports: [CommonModule, SharedModule, FormsModule],
  exports: [ManageCustomMetadataComponent],
})
export class ManageMetadataModule {}
