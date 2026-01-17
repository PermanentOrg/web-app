import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SearchService } from './services/search.service';
import { GlobalSearchBarComponent } from './components/global-search-bar/global-search-bar.component';
import { GlobalSearchResultsComponent } from './components/global-search-results/global-search-results.component';

@NgModule({
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	declarations: [GlobalSearchBarComponent, GlobalSearchResultsComponent],
	imports: [CommonModule, SharedModule, FormsModule],
	providers: [SearchService],
	exports: [GlobalSearchBarComponent, GlobalSearchResultsComponent],
})
export class SearchModule {}
