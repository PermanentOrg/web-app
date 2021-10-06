import { Shallow } from 'shallow-render';
import { NewArchiveFormComponent } from './new-archive-form.component';
import { SharedModule } from '@shared/shared.module';
import { ApiService } from '@shared/services/api/api.service';

let created: boolean = false;
let throwError: boolean = false;
let createdArchive: any;

const mockApiService = {
  archive: {
    create: async (data: any) => {
      if (throwError) {
        throw "Test Error";
      }
      created = true;
      createdArchive = data;
      return {
        getArchiveVO: () => {
          return data;
        }
      }
    }
  }
}

describe('NewArchiveFormComponent #onboarding', () => {
  let shallow: Shallow<NewArchiveFormComponent>;
  function fillOutForm (find: (a: string) => any) {
    const input = find('#newArchiveName');
    input.nativeElement.value = 'Test User';
    input.triggerEventHandler('input', { target: input.nativeElement });
    const radio = find('input[type="radio"][required]');
    radio.nativeElement.click();
  }
  beforeEach(() => {
    created = false;
    createdArchive = null;
    throwError = false;
    //I hate to do this but I don't have time to mock out the entire API service in a type-safe way.
    //@ts-ignore
    shallow = new Shallow(NewArchiveFormComponent, SharedModule).mock(ApiService, mockApiService);
  });
  it('should create', async () => {
    const { element } = await shallow.render();
    expect(element).not.toBeNull();
  });
  it('should not submit when form is invalid', async () => {
    const { find, fixture, outputs } = await shallow.render();
    expect(find('button').nativeElement.disabled).toBeFalsy();
    find('button').nativeElement.click();
    expect(outputs.success.emit).not.toHaveBeenCalled();
    expect(outputs.error.emit).not.toHaveBeenCalled();
  });
  it('should disable button when form is waiting', async () => {
    const { find, fixture } = await shallow.render();
    fillOutForm(find);
    fixture.detectChanges();
    find('button').nativeElement.click();
    fixture.detectChanges();
    expect(find('button').nativeElement.disabled).toBeTruthy();
  });
  it('should create a new archive on submit', async () => {
    const { find, fixture } = await shallow.render();
    fillOutForm(find);
    fixture.detectChanges();
    find('button').nativeElement.click();
    fixture.detectChanges();
    expect(created).toBeTrue();
  });
  it('should output new archiveVO when submitted', async () => {
    const { find, fixture, outputs } = await shallow.render();
    fillOutForm(find);
    fixture.detectChanges();
    find('button').nativeElement.click();
    await fixture.whenStable();
    expect(outputs.success.emit).toHaveBeenCalled();
    expect(outputs.error.emit).not.toHaveBeenCalled();
  });
  it('should output errors if they occur', async () => {
    throwError = true;
    const { find, fixture, outputs } = await shallow.render();
    fillOutForm(find);
    fixture.detectChanges();
    find('button').nativeElement.click();
    await fixture.whenStable();
    expect(outputs.error.emit).toHaveBeenCalled();
    expect(outputs.success.emit).not.toHaveBeenCalled();
  });
});
