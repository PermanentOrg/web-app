import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { SearchBoxComponent } from './search-box.component';

const mockApiService = {
	search: {
		archiveByNameObservable: () => {},
	},
};

const mockRouter = {
	navigate: jasmine.createSpy('navigate'),
};

describe('SearchBoxComponent', () => {
	let fixture: ComponentFixture<SearchBoxComponent>;
	let component: SearchBoxComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ReactiveFormsModule],
			declarations: [SearchBoxComponent],
			providers: [
				{ provide: ApiService, useValue: mockApiService },
				{ provide: Router, useValue: mockRouter },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(SearchBoxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should exist', () => {
		expect(component).toBeTruthy();
	});
});
