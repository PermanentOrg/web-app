import { Shallow } from 'shallow-render';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { MessageService } from '@shared/services/message/message.service';
import { ShareLinksApiService } from '@root/app/share-links/services/share-links-api.service';
import { RecordVO } from '@models/index';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ElementRef } from '@angular/core';
import { ShareLinkSettingsComponent } from './share-link-settings.component';

const mockShareLinkApiService = {};

describe('ShareLinkSettingsComponent', () => {
  
  let shallow: Shallow<ShareLinkSettingsComponent>;

  beforeEach(() => {
    shallow = new Shallow(
      ShareLinkSettingsComponent,
      FileBrowserComponentsModule,
    )
      .mock(MessageService, {
        showError: () => {},
      })
      .mock(ShareLinksApiService, mockShareLinkApiService)
      .dontMock(NoopAnimationsModule)
      .import(NoopAnimationsModule);
  });

  it('should create', async () => {
    const { instance, fixture } = await shallow.render();

    instance.shareLinkResponse = {
      itemType: 'record',
      token: 'abc123',
      itemId: 'id001',
      createdAt: new Date(),
      accessRestrictions: 'account',
      permissionsLevel: 'viewer',
    };

    fixture.detectChanges();
    instance.ngOnInit();

    expect(instance).toBeTruthy();
  });

  it('should render the share link if present', async () => {
    const testLink = 'https://share.com/abc123';

    const { find, instance, fixture } = await shallow.render();

    instance.shareLink = testLink;

    fixture.detectChanges();

    instance.ngOnInit();

    const input = find('input[type="text"]');

    expect(input.nativeElement.value).toBe(testLink);
  });

  it('should copy share link and show copied message', async () => {
    const { instance, fixture, find } = await shallow.render();

    instance.shareLink = 'https://share.com/abc123';
    instance.shareLinkResponse = {
      itemType: 'record',
      token: 'abc123',
      itemId: 'id001',
      createdAt: new Date(),
      accessRestrictions: 'account',
      permissionsLevel: 'viewer',
    };
    instance.shareItem = {
      recordId: 'id001',
    } as RecordVO;

    fixture.detectChanges();

    instance.ngOnInit();

    const input = document.createElement('input');
    input.value = 'https://share.com/abc123';
    instance.shareUrlInput = { nativeElement: input } as ElementRef;

    spyOn(document, 'execCommand').and.returnValue(true);

    instance.copyShareLink();
    fixture.detectChanges();

    expect(instance.linkCopied).toBeTrue();
  });

  it('should copy the share link and set linkCopied = true', async () => {
    const { instance, fixture } = await shallow.render();

    instance.shareLinkResponse = {
      itemType: 'record',
      token: 'abc123',
      itemId: 'id001',
      createdAt: new Date(),
      accessRestrictions: 'account',
      permissionsLevel: 'viewer',
    };

    const inputEl = document.createElement('input');
    inputEl.value = 'https://test-link.com';
    document.body.appendChild(inputEl);

    instance.shareLink = inputEl.value;
    (instance as any).shareUrlInput = { nativeElement: inputEl };

    instance.copyShareLink();
    fixture.detectChanges();

    expect(instance.linkCopied).toBeTrue();

    setTimeout(() => {
      expect(instance.linkCopied).toBeFalse();
    }, 5000);
  });

  it('should toggle showLinkSettings when button is clicked', async () => {
    const { instance, fixture, find } = await shallow.render();

    instance.shareLinkResponse = {
      itemType: 'record',
      token: 'abc123',
      itemId: 'id001',
      createdAt: new Date(),
      accessRestrictions: 'account',
      permissionsLevel: 'viewer',
    };

    instance.shareLink = 'https://link.com';
    fixture.detectChanges();

    const toggleButton = find('button.btn-link');
    toggleButton.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(instance.showLinkSettings).toBeTrue();

    toggleButton.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(instance.showLinkSettings).toBeFalse();
  });
  it('should render input field when shareLink is set', async () => {
    const { instance, fixture, find } = await shallow.render();

    const inputEl = document.createElement('input');
    inputEl.value = 'https://copied.com';
    document.body.appendChild(inputEl);

    instance.shareLink = inputEl.value;
    fixture.detectChanges();

    const input = find('input.form-control');

    expect(input).toBeTruthy();
  });
  it('should call removeShareLink when .remove-link is clicked', async () => {
    const { instance, find, fixture } = await shallow.render();

    spyOn(instance, 'removeShareLink');
    instance.shareLink = 'some-link';
    fixture.detectChanges();

    find('.remove-link').triggerEventHandler('click');

    expect(instance.removeShareLink).toHaveBeenCalled();
  });
  it('should call onShareLinkPropChange when autoApproveToggle changes', async () => {
    const { instance, fixture, find } = await shallow.render();

    spyOn(instance, 'onShareLinkPropChange');
    instance.accessRestrictions = 'account';
    instance.shareLink = 'some-link';
    instance.showLinkSettings = true;
    instance.shareLinkResponse = {
      itemType: 'record',
      token: 'abc123',
      itemId: 'id001',
      createdAt: new Date(),
      accessRestrictions: 'account',
      permissionsLevel: 'viewer',
    };
    instance.ngOnInit()
    fixture.detectChanges();

    const input = find('.auto-approve-off');
    input.nativeElement.checked = true;
    input.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(instance.onShareLinkPropChange).toHaveBeenCalledWith(
      'autoApproveToggle',
      0,
    );
  });
  it('should update permissionsLevel on role change', async () => {
    const { instance, fixture, find } = await shallow.render();

    spyOn(instance, 'onShareLinkPropChange');
    instance.accessRestrictions = 'account';
    instance.canShare = true;
    instance.shareLink = 'some-link';
    instance.showLinkSettings = true; 
    instance.shareLinkResponse = {
      itemType: 'record',
      token: 'abc123',
      itemId: 'id001',
      createdAt: new Date(),
      accessRestrictions: 'account',
      permissionsLevel: 'viewer',
    };

    instance.ngOnInit();
    fixture.detectChanges();

    const select = find('.permission-select');
    select.nativeElement.value = 'editor';
    select.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(instance.onShareLinkPropChange).toHaveBeenCalledWith(
      'permissionsLevel',
      'editor',
    );
  });
});
