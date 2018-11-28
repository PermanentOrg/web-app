import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { Router } from '@angular/router';

import { MessageComponent } from '@shared/components/message/message.component';

describe('MessageComponent', () => {
  let component: MessageComponent;
  let fixture: ComponentFixture<MessageComponent>;

  const testUrl = ['/test'];

  beforeEach(async(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.declarations.push(MessageComponent);

    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept a navigation url', () => {
    component.display('test', null, testUrl);
    expect(component.navigateTo).toEqual(testUrl);
  });

  it('should only dismiss when click if no navigation URL given', () => {
    const router = TestBed.get(Router);
    spyOn(router, 'navigate');
    spyOn(component, 'dismiss');

    component.display('test');
    expect(component.navigateTo).toBeFalsy();

    component.onClick();

    expect(component.dismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate and dismiss when clicked if navigation URL given', () => {
    const router = TestBed.get(Router);
    spyOn(router, 'navigate');
    spyOn(component, 'dismiss');

    component.display('test', null, testUrl);

    component.onClick();

    expect(component.dismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(testUrl, {queryParams: {}});
  });

  it('should navigate and dismiss when clicked if navigation URL and param given', () => {
    const router = TestBed.get(Router);
    spyOn(router, 'navigate');
    spyOn(component, 'dismiss');

    component.display('test', null, testUrl, {testParam: true});

    component.onClick();

    expect(component.dismiss).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(testUrl, {queryParams: {testParam: true}});
  });
});
