import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faEllipsisH,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ManageCustomMetadataComponent } from './manage-custom-metadata/manage-custom-metadata.component';
import { MetadataValuePipe } from './pipes/metadata-value.pipe';
import { AddNewValueComponent } from './subcomponents/value-add/add-new-value.component';
import { EditValueComponent } from './subcomponents/value-edit/value-edit.component';
import { FormCreateComponent } from './subcomponents/form-create/form-create.component';
import { AddNewCategoryComponent } from './subcomponents/category-add/add-new-category.component';
import { FormEditComponent } from './subcomponents/form-edit/form-edit.component';
import { CategoryEditComponent } from './subcomponents/category-edit/category-edit.component';

@NgModule({
  declarations: [
    ManageCustomMetadataComponent,
    MetadataValuePipe,
    AddNewValueComponent,
    EditValueComponent,
    FormCreateComponent,
    AddNewCategoryComponent,
    FormEditComponent,
    CategoryEditComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    FontAwesomeModule,
    A11yModule,
  ],
  exports: [ManageCustomMetadataComponent],
})
export class ManageMetadataModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(faEllipsisH, faEdit, faTrash);
  }
}
