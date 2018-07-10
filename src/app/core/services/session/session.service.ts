import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private store: Object;

  constructor() {
    if (!window.sessionStorage) {
      this.store = {};
    }
  }

  public get(key) {
    if (this.store) {
      return this.store[key];
    } else {
      return window.sessionStorage.getItem(key);
    }
  }

  public set(key, value) {
    if (this.store) {
      this.store[key] = value;
    } else {
      window.sessionStorage.setItem(key, value);
    }
  }

  public delete(key) {
    if (this.store) {
      delete this.store[key];
    } else {
      window.sessionStorage.removeItem(key);
    }
  }
}
