import { FormCreateComponent } from './form-create.component';
import { Shallow } from 'shallow-render';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { FormsModule } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { TagVOData } from '@models/tag-vo';
import { async } from '@firebase/util';

fdescribe('AddNewValueComponent', () => {
  let shallow: Shallow<FormCreateComponent>;

  const defaultRender = async (
    c: (tagName: string) => Promise<void> = async () => {}
  ) =>
    await shallow.render(
      '<pr-metadata-creation-form placeholder="Add New Test" [submitCallback]="callback"></pr-metadata-creation-form>',
      {
        bind: {
          callback: c,
        },
      }
    );

  beforeEach(async () => {
    shallow = new Shallow(FormCreateComponent, ManageMetadataModule).import(
      FormsModule
    );
    // .mock(MessageService, {
    //   showError: () => {
    //     messageShown = true;
    //   },
    // });
  });

  it('should create', async () => {
    const { element } = await defaultRender();
    expect(element).not.toBeNull();
  });

  it('should be a text label at first', async () => {
    const { find } = await defaultRender();
    expect(find('.placeholder-text').length).toBe(1);
    expect(find('input').length).toBe(0);
  });

  it('should open up to a textbox', async () => {
    const { find, fixture } = await defaultRender();
    find('.placeholder-text').triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(find('input').length).toBe(1);
  });

  it('should use specified placeholder text', async () => {
    const { find, fixture } = await defaultRender();
    expect(find('.placeholder-text').nativeElement.innerText).toBe(
      'Add New Test'
    );
    find('.placeholder-text').triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(find('input').nativeElement.placeholder).toBe('Add New Test');
  });

  it('should take in a callback and execute it', async () => {
    let createdTag = '';
    const { instance, find, fixture } = await defaultRender(async (tagName) => {
      createdTag = tagName;
    });
    find('.placeholder-text').triggerEventHandler('click', {});
    fixture.detectChanges();
    const input = find('input');
    input.nativeElement.value = 'abc';
    input.triggerEventHandler('input', { target: input.nativeElement });
    fixture.detectChanges();
    find('form').triggerEventHandler('submit', {
      target: find('form').nativeElement,
    });
    expect(instance.waiting).toBe(true);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(createdTag).toBe('abc');
    expect(instance.waiting).toBe(false);
    expect(find('.placeholder-text').length).toBe(1);
  });

  it('should not close editor if callback promise is rejected', async () => {
    const { instance, find, fixture } = await defaultRender(async (tagName) => {
      throw new Error();
    });
    find('.placeholder-text').triggerEventHandler('click', {});
    fixture.detectChanges();
    const input = find('input');
    input.nativeElement.value = 'abc';
    input.triggerEventHandler('input', { target: input.nativeElement });
    fixture.detectChanges();
    find('form').triggerEventHandler('submit', {
      target: find('form').nativeElement,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(instance.waiting).toBe(false);
    expect(find('input').length).toBe(1);
  });

  it('should blank out the form after submitting', async () => {
    const { instance } = await defaultRender();
    instance.newTagName = 'potato';
    await instance.runSubmitCallback();
    expect(instance.newTagName).toBe('');
  });
});
