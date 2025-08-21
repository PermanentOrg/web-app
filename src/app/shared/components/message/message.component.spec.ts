/* @format */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { Router } from '@angular/router';

import { MessageComponent } from '@shared/components/message/message.component';

describe('MessageComponent', () => {
	let component: MessageComponent;
	let fixture: ComponentFixture<MessageComponent>;

	const testUrl = ['/test'];

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.declarations.push(MessageComponent);

		TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(MessageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should accept a navigation url', () => {
		component.display({ message: 'test', navigateTo: testUrl });

		expect(component.navigateTo).toEqual(testUrl);
	});

	it('should only dismiss when click if no navigation URL given', () => {
		const router = TestBed.inject(Router);
		spyOn(router, 'navigate');
		spyOn(component, 'dismiss');

		component.display({ message: 'test' });

		expect(component.navigateTo).toBeFalsy();

		component.onClick();

		expect(component.dismiss).toHaveBeenCalledTimes(1);
		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('should navigate and dismiss when clicked if navigation URL given', () => {
		const router = TestBed.inject(Router);
		spyOn(router, 'navigate');
		spyOn(component, 'dismiss');

		component.display({ message: 'test', navigateTo: testUrl });

		component.onClick();

		expect(component.dismiss).toHaveBeenCalledTimes(1);
		expect(router.navigate).toHaveBeenCalledTimes(1);
		expect(router.navigate).toHaveBeenCalledWith(testUrl, {
			queryParams: undefined,
		});
	});

	it('should navigate and dismiss when clicked if navigation URL and param given', () => {
		const router = TestBed.inject(Router);
		spyOn(router, 'navigate');
		spyOn(component, 'dismiss');

		component.display({
			message: 'test',
			navigateTo: testUrl,
			navigateParams: { testParam: true },
		});

		component.onClick();

		expect(component.dismiss).toHaveBeenCalledTimes(1);
		expect(router.navigate).toHaveBeenCalledTimes(1);
		expect(router.navigate).toHaveBeenCalledWith(testUrl, {
			queryParams: { testParam: true },
		});
	});

	it('should dismiss the component when clicking on the X icon', () => {
		spyOn(component, 'dismiss');

		const closeIcon =
			fixture.debugElement.nativeElement.querySelector('.material-icons');
		closeIcon.click();
		fixture.detectChanges();

		expect(component.dismiss).toHaveBeenCalledTimes(1);
	});

	it('should display the external URL if it exists', () => {
		component.externalUrl = 'https://www.example.com';
		component.externalMessage = 'test message';
		component.visible = true;
		fixture.detectChanges();

		const externalLink = fixture.debugElement.nativeElement.querySelector('a');

		expect(externalLink).toBeTruthy();

		expect(externalLink.href).toEqual('https://www.example.com/');
	});
});
