import { TestBed, inject } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  const testKey = 'test';
  const testValue = 'testValue';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });

    window.sessionStorage.clear();
  });

  it('should be created', inject([StorageService], (service: StorageService) => {
    expect(service).toBeTruthy();
  }));

  it('should save a value to SessionStorage', inject([StorageService], (service: StorageService) => {
    if (window.sessionStorage) {
      service.session.set(testKey, testValue);
      expect(window.sessionStorage.getItem(testKey)).toEqual(testValue);
    }
  }));

  it('should retrieve a value from SessionStorage', inject([StorageService], (service: StorageService) => {
    if (window.sessionStorage) {
      window.sessionStorage.setItem(testKey, testValue);
      expect(service.session.get(testKey)).toEqual(testValue);
    }
  }));

  it('should save a value when SessionStorage not present', inject([StorageService], (service: StorageService) => {
    service.session.setStoreInMemory(true);
    service.session.set(testKey, testValue);
    expect(service.session.get(testKey)).toEqual(testValue);
  }));

  it('should save a value to LocalStorage', inject([StorageService], (service: StorageService) => {
    if (window.localStorage) {
      service.local.set(testKey, testValue);
      expect(window.localStorage.getItem(testKey)).toEqual(testValue);
    }
  }));

  it('should retrieve a value from LocalStorage', inject([StorageService], (service: StorageService) => {
    if (window.localStorage) {
      window.localStorage.setItem(testKey, testValue);
      console.log(window.localStorage.getItem(testKey));
      expect(service.local.get(testKey)).toEqual(testValue);
    }
  }));

  it('should save a value when LocalStorage not present', inject([StorageService], (service: StorageService) => {
    service.local.setStoreInMemory(true);
    service.local.set(testKey, testValue);
    expect(service.local.get(testKey)).toEqual(testValue);
  }));
});
