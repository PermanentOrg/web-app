import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventObserver, EventService } from './event.service';
import { PermanentEvent } from './event-types';

import { vi } from 'vitest';

describe('EventService', () => {
	beforeEach(async () => {
		await MockBuilder(EventService).keep(HttpClientTestingModule, {
			export: true,
		});
	});

	it('should be created', () => {
		const instance = TestBed.inject(EventService);

		expect(instance).toBeTruthy();
	});

	it('should add an observer', () => {
		const instance = TestBed.inject(EventService);
		const mockObserver: EventObserver = {
			update: async (_: PermanentEvent) => {},
		};

		instance.addObserver(mockObserver);

		expect(instance.getObservers()).toContain(mockObserver);
	});

	it('should notify all observers', () => {
		const instance = TestBed.inject(EventService);
		const mockObserver1: EventObserver = {
			update: vi.fn(),
		};
		const mockObserver2: EventObserver = {
			update: vi.fn(),
		};

		instance.addObserver(mockObserver1);
		instance.addObserver(mockObserver2);

		const eventData: PermanentEvent = {
			entity: 'account',
			action: 'login',
		};
		instance.dispatch(eventData);

		expect(mockObserver1.update).toHaveBeenCalledWith(eventData);
		expect(mockObserver2.update).toHaveBeenCalledWith(eventData);
	});

	it('should remove an observer', () => {
		const instance = TestBed.inject(EventService);
		const mockObserver: EventObserver = {
			update: vi.fn(),
		};

		instance.addObserver(mockObserver);
		instance.removeObserver(mockObserver);
		instance.dispatch({
			entity: 'account',
			action: 'login',
		});

		expect(mockObserver.update).not.toHaveBeenCalled();
	});

	it('should not notify removed observers', () => {
		const instance = TestBed.inject(EventService);
		const mockObserver: EventObserver = {
			update: vi.fn(),
		};
		const mockObserver2: EventObserver = {
			update: vi.fn(),
		};

		instance.addObserver(mockObserver);
		instance.addObserver(mockObserver2);
		instance.removeObserver(mockObserver);

		instance.dispatch({
			entity: 'account',
			action: 'login',
		});

		expect(mockObserver.update).not.toHaveBeenCalled();
	});
});
