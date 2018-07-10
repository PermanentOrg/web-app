import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public session: BaseStorage;
  public local: BaseStorage;

  constructor() {
    this.session = new BaseStorage(window.sessionStorage);
    this.local = new BaseStorage(window.localStorage);
  }
}

class BaseStorage {
  private store: Object;
  private storeInMemory: Boolean;

  constructor(private storage: any) {
    if (!this.storage) {
      this.setStoreInMemory(true);
    }
  }

  public get(key) {
    if (this.storeInMemory) {
      return this.store[key];
    } else {
      return this.storage.getItem(key);
    }
  }

  public set(key, value) {
    if (this.storeInMemory) {
      this.store[key] = value;
    } else {
      this.storage.setItem(key, value);
    }
  }

  public delete(key) {
    if (this.storeInMemory) {
      delete this.store[key];
    } else {
      this.storage.removeItem(key);
    }
  }

  public setStoreInMemory(storeInMemory: Boolean) {
    this.storeInMemory = storeInMemory;
    if (this.storeInMemory && !this.store) {
      this.store = {};
    } else {
      this.store = null;
    }
  }
}
