import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
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
	private storeInMemory: boolean;

	constructor(private storage: any) {
		if (!this.storage) {
			this.setStoreInMemory(true);
		}
	}

	public get<T = any>(key): T {
		if (this.storeInMemory) {
			return this.store[key];
		} else {
			const storeValue = this.storage.getItem(key);
			if (!storeValue || storeValue.length < 2) {
				return storeValue;
			} else if (
				storeValue[0] === '[' &&
				storeValue[storeValue.length - 1] === ']'
			) {
				return JSON.parse(storeValue);
			} else if (
				storeValue[0] === '{' &&
				storeValue[storeValue.length - 1] === '}'
			) {
				return JSON.parse(storeValue);
			} else if (
				storeValue[0] === '"' &&
				storeValue[storeValue.length - 1] === '"'
			) {
				return JSON.parse(storeValue);
			} else {
				return storeValue;
			}
		}
	}

	public set<T = any>(key, value: T) {
		if (this.storeInMemory) {
			this.store[key] = value;
		} else {
			if (value) {
				const isString = typeof value === 'string';
				this.storage.setItem(key, isString ? value : JSON.stringify(value));
			} else {
				this.delete(key);
			}
		}
	}

	public delete(key) {
		if (this.storeInMemory) {
			delete this.store[key];
		} else {
			this.storage.removeItem(key);
		}
	}

	public clear() {
		if (this.storeInMemory) {
			this.store = {};
		} else {
			this.storage.clear();
		}
	}

	public setStoreInMemory(storeInMemory: boolean) {
		this.storeInMemory = storeInMemory;
		if (this.storeInMemory && !this.store) {
			this.store = {};
		} else {
			this.store = null;
		}
	}
}
