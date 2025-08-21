import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { SharedModule } from '@shared/shared.module';
import { ArchiveVO, ConnectorOverviewVO, FolderVO } from '@root/app/models';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ConnectorComponent } from './connector.component';

@Component({
	selector: `pr-test-host-component`,
	template: `@if (connector) {
		<pr-connector
			[connector]="connector"
			[appsFolder]="appsFolder"
		></pr-connector>
	}`,
	standalone: false,
})
class TestHostComponent {
	@ViewChild(ConnectorComponent) public component: ConnectorComponent;
	public connector: ConnectorOverviewVO;
	public appsFolder: FolderVO = new FolderVO({
		folderId: 1,
		ChildItemVOs: [],
	});
}

describe('ConnectorComponent', () => {
	let hostComponent: TestHostComponent;
	let component: ConnectorComponent;
	let fixture: ComponentFixture<TestHostComponent>;

	const currentArchive = new ArchiveVO({ archiveId: 1 });

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.imports.push(SharedModule);
		config.declarations.push(TestHostComponent, ConnectorComponent);

		TestBed.resetTestingModule();
		await TestBed.configureTestingModule(config).compileComponents();

		const accountService = TestBed.inject(AccountService);
		accountService.setArchive(currentArchive);

		fixture = TestBed.createComponent(TestHostComponent);
		hostComponent = fixture.componentInstance;
		fixture.detectChanges();
		component = hostComponent.component;
	});

	afterEach(() => {
		const accountService = TestBed.inject(AccountService);
		accountService.clearArchive();
	});

	it('should not exist with a connector', () => {
		expect(component).toBeFalsy();
	});

	it('should create when a connector overview exists', () => {
		hostComponent.connector = new ConnectorOverviewVO({
			connector_overviewId: 1,
			archiveId: 1,
			type: 'type.connector.facebook',
		});
		fixture.detectChanges();

		expect(hostComponent.component).toBeTruthy();
	});

	it('should show the correct buttons for a disconnected FamilySearch connector', () => {
		hostComponent.connector = new ConnectorOverviewVO({
			connector_overviewId: 1,
			archiveId: 1,
			type: 'type.connector.familysearch',
		});
		fixture.detectChanges();
		component = hostComponent.component;

		const compiled = fixture.debugElement.nativeElement as HTMLElement;
		const button = compiled.querySelector(
			'button#connector-connect',
		) as HTMLButtonElement;

		expect(button).toBeDefined();
		expect(button.getAttribute('hidden')).toBeNull();
		expect(button.innerText).toBe('Sign In with FamilySearch');
	});

	it('should show the correct buttons for a connected Familysearch connector in a regular archive', () => {
		hostComponent.connector = new ConnectorOverviewVO({
			connector_overviewId: 1,
			archiveId: 1,
			type: 'type.connector.familysearch',
			status: 'status.connector.connected',
		});
		fixture.detectChanges();
		component = hostComponent.component;

		const compiled = fixture.debugElement.nativeElement as HTMLElement;

		const connectButton = compiled.querySelector(
			'button#connector-connect',
		) as HTMLButtonElement;

		expect(connectButton.getAttribute('hidden')).not.toBeNull();

		const importButton = compiled.querySelector(
			'button#familysearch-tree-import',
		) as HTMLButtonElement;

		expect(importButton.getAttribute('hidden')).toBeNull();

		const uploadButton = compiled.querySelector(
			'button#familysearch-upload',
		) as HTMLButtonElement;

		expect(uploadButton.getAttribute('hidden')).not.toBeNull();

		const downloadButton = compiled.querySelector(
			'button#familysearch-download',
		) as HTMLButtonElement;

		expect(downloadButton.getAttribute('hidden')).not.toBeNull();
	});

	it('should show the correct buttons for a connected Familysearch connector in an imported archive', () => {
		hostComponent.connector = new ConnectorOverviewVO({
			ConnectorFamilysearchVO: {},
			connector_overviewId: 1,
			archiveId: 1,
			type: 'type.connector.familysearch',
			status: 'status.connector.connected',
		});
		fixture.detectChanges();
		component = hostComponent.component;

		const compiled = fixture.debugElement.nativeElement as HTMLElement;

		const connectButton = compiled.querySelector(
			'button#connector-connect',
		) as HTMLButtonElement;

		expect(connectButton.getAttribute('hidden')).not.toBeNull();

		const importButton = compiled.querySelector(
			'button#familysearch-tree-import',
		) as HTMLButtonElement;

		expect(importButton.getAttribute('hidden')).toBeNull();

		const uploadButton = compiled.querySelector(
			'button#familysearch-upload',
		) as HTMLButtonElement;

		expect(uploadButton.getAttribute('hidden')).toBeNull();

		const downloadButton = compiled.querySelector(
			'button#familysearch-download',
		) as HTMLButtonElement;

		expect(downloadButton.getAttribute('hidden')).toBeNull();
	});

	it('should display correct connector class for FamilySearch connector', () => {
		hostComponent.connector = new ConnectorOverviewVO({
			type: 'type.connector.familysearch',
		});
		fixture.detectChanges();
		const connectorComponentInstance = hostComponent.component;

		expect(connectorComponentInstance).toBeDefined();

		const connectorClass = connectorComponentInstance.getConnectorClass(
			hostComponent.connector.type,
		);
		const tooltip = connectorComponentInstance.getTooltip();

		expect(connectorClass).toEqual('connector-familysearch');
	});

	it('should call connect() method when Connect button is clicked', () => {
		hostComponent.connector = new ConnectorOverviewVO({
			connector_overviewId: 2,
			archiveId: 1,
			type: 'type.connector.familysearch',
		});
		fixture.detectChanges();

		const connectorComponentInstance = fixture.debugElement.query(
			By.directive(ConnectorComponent),
		).componentInstance;
		spyOn(connectorComponentInstance, 'connect');

		const button = fixture.debugElement.nativeElement.querySelector(
			'button#connector-connect',
		);
		button.click();

		expect(connectorComponentInstance.connect).toHaveBeenCalled();
	});
});
