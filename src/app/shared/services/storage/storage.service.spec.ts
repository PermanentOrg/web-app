/* @format */
import { TestBed } from '@angular/core/testing';

import { StorageService } from '@shared/services/storage/storage.service';

describe('StorageService', () => {
	const testKey = 'test';
	const testValue = 'testValue';
	const testObject = {
		key1: 'value1',
		key2: 'value2',
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [StorageService],
		});

		window.sessionStorage.clear();
		window.localStorage.clear();
	});

	it('should be created', () => {
		const service = TestBed.inject(StorageService);

		expect(service).toBeTruthy();
	});

	it('should save a string value to SessionStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.sessionStorage) {
			service.session.set(testKey, testValue);

			expect(window.sessionStorage.getItem(testKey)).toEqual(testValue);
		}
	});

	it('should retrieve a string value from SessionStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.sessionStorage) {
			window.sessionStorage.setItem(testKey, testValue);

			expect(service.session.get(testKey)).toEqual(testValue);
		}
	});

	it('should save an object value to SessionStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.sessionStorage) {
			service.session.set(testKey, testObject);

			expect(JSON.parse(window.sessionStorage.getItem(testKey))).toEqual(
				testObject,
			);
		}
	});

	it('should retrieve an object value from SessionStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.sessionStorage) {
			window.sessionStorage.setItem(testKey, JSON.stringify(testObject));

			expect(service.session.get(testKey)).toEqual(testObject);
		}
	});

	it('should handle an undefined value from SessionStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.sessionStorage) {
			expect(service.session.get(testKey)).toBeFalsy();
		}
	});

	it('should handle storing a null-ish value to SessionStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.sessionStorage) {
			service.session.set(testKey, null);

			expect(service.session.get(testKey)).toBeNull();
			service.session.delete(testKey);
			service.session.set(testKey, false);

			expect(service.session.get(testKey)).toBeFalsy();
		}
	});

	it('should save a value to memory when SessionStorage not present', () => {
		const service = TestBed.inject(StorageService);
		service.session.setStoreInMemory(true);
		service.session.set(testKey, testValue);

		expect(service.session.get(testKey)).toEqual(testValue);
	});

	it('should save a string value to LocalStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.localStorage) {
			service.local.set(testKey, testValue);

			expect(window.localStorage.getItem(testKey)).toEqual(testValue);
		}
	});

	it('should retrieve a string value from LocalStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.localStorage) {
			window.localStorage.setItem(testKey, testValue);

			expect(service.local.get(testKey)).toEqual(testValue);
		}
	});

	it('should save an object value to LocalStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.localStorage) {
			service.local.set(testKey, testObject);

			expect(JSON.parse(window.localStorage.getItem(testKey))).toEqual(
				testObject,
			);
		}
	});

	it('should retrieve an object value from LocalStorage', () => {
		const service = TestBed.inject(StorageService);
		if (window.localStorage) {
			window.localStorage.setItem(testKey, JSON.stringify(testObject));

			expect(service.local.get(testKey)).toEqual(testObject);
		}
	});

	it('should save a value to memory when LocalStorage not present', () => {
		const service = TestBed.inject(StorageService);
		service.local.setStoreInMemory(true);
		service.local.set(testKey, testValue);

		expect(service.local.get(testKey)).toEqual(testValue);
	});
});
