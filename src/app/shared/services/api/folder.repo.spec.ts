// This suite doesn't actually have any tests, but for some reason the setup
// was causing the test bed to get contaminated.
// For this reason, I comment it out!  There are other tests
// fully commented out, and we will be cleaning them up

// import { TestBed } from '@angular/core/testing';
// import {
// 	HttpTestingController,
// 	provideHttpClientTesting,
// } from '@angular/common/http/testing';

// import { HttpService } from '@shared/services/http/http.service';
// import { FolderRepo } from '@shared/services/api/folder.repo';
// import {
// 	provideHttpClient,
// 	withInterceptorsFromDi,
// } from '@angular/common/http';

// describe('FolderRepo', () => {
// 	let repo: FolderRepo;
// 	let httpMock: HttpTestingController;

// 	beforeEach(() => {
// 		TestBed.configureTestingModule({
// 			imports: [],
// 			providers: [
// 				HttpService,
// 				provideHttpClient(withInterceptorsFromDi()),
// 				provideHttpClientTesting(),
// 			],
// 		});

// 		httpMock = TestBed.inject(HttpTestingController);
// 	});

// 	afterEach(() => {
// 		httpMock.verify();
// 	});
// });
