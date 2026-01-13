import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectArchiveTypeScreenComponent } from './select-archive-type-screen.component';

describe('SelectArchiveTypeScreenComponent', () => {
	let component: SelectArchiveTypeScreenComponent;
	let fixture: ComponentFixture<SelectArchiveTypeScreenComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SelectArchiveTypeScreenComponent],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(SelectArchiveTypeScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with default values', () => {
		expect(component.selectedValue).toBe('');
		expect(component.buttonText).toBe('a Personal');
		expect(component.headerText).toBe('');
		expect(component.tag).toBe('');
		expect(component.type).toBe('');
	});

	it('should emit navigation event when navigate is called with start', () => {
		spyOn(component.submitEmitter, 'emit');
		component.type = 'mockType';
		component.tag = 'mockTag';
		component.headerText = 'mockHeaderText';
		component.navigate('start');

		expect(component.submitEmitter.emit).toHaveBeenCalledWith({
			screen: 'start',
			type: 'mockType',
			tag: 'mockTag',
			headerText: 'mockHeaderText',
		});
	});

	it('should emit submit event when navigate is called with other screen', () => {
		spyOn(component.submitEmitter, 'emit');
		component.type = 'mockType';
		component.tag = 'mockTag';
		component.headerText = 'mockHeaderText';

		component.navigate('name-archive');

		expect(component.submitEmitter.emit).toHaveBeenCalledWith({
			screen: 'name-archive',
			type: 'mockType',
			tag: 'mockTag',
			headerText: 'mockHeaderText',
		});
	});

	it('should call navigate with start when Back button is clicked', () => {
		spyOn(component, 'navigate');
		const backButton = fixture.debugElement.query(By.css('.back-button'));
		backButton.triggerEventHandler('buttonClick', null);

		expect(component.navigate).toHaveBeenCalledWith('start');
	});

	it('should call navigate with name-archive when create archive button is clicked', () => {
		spyOn(component, 'navigate');
		component.selectedValue = 'someValue';
		fixture.detectChanges();

		const createButton = fixture.debugElement.query(
			By.css('.create-archive-button'),
		);
		createButton.triggerEventHandler('buttonClick', null);

		expect(component.navigate).toHaveBeenCalledWith('name-archive');
	});

	it('should set buttonText correctly in ngOnInit if tag is defined', () => {
		// Create a new fixture to test with tag input
		const testFixture = TestBed.createComponent(
			SelectArchiveTypeScreenComponent,
		);
		const testComponent = testFixture.componentInstance;
		testComponent.tag = 'type:community';
		testFixture.detectChanges();

		testComponent.ngOnInit();

		expect(testComponent.buttonText).toBe('a Community');
	});

	it('should not call generateElementText if tag is not defined', () => {
		component.tag = '';

		fixture.detectChanges();

		component.ngOnInit();

		expect(component.buttonText).toBe('a Personal'); // Default value
	});
});
