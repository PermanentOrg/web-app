import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from './services/search.service';
import { SharedModule } from '@shared/shared.module';
import { GlobalSearchBarComponent } from './components/global-search-bar/global-search-bar.component';
import { GlobalSearchResultsComponent } from './components/global-search-results/global-search-results.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [GlobalSearchBarComponent, GlobalSearchResultsComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  providers: [
    SearchService
  ],
  exports: [
    GlobalSearchBarComponent,
    GlobalSearchResultsComponent
  ]
})
export class SearchModule { }
