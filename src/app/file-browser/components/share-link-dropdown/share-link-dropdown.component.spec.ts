import { Shallow } from 'shallow-render';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';
import { ShareLinkDropdownComponent } from './share-link-dropdown.component';

describe('ShareLinkDropdownComponent', () => {
  let shallow: Shallow<ShareLinkDropdownComponent>;

  beforeEach(async () => {
    shallow = new Shallow(
      ShareLinkDropdownComponent,
      FileBrowserComponentsModule,
    );
  });

  it('should create', async () => {
    const { instance } = await shallow.render();

    expect(instance).toBeTruthy();
  });

  it('should display all passed link types when dropdown is open', async () => {
    const linkTypes = [
      { value: 'viewer', text: 'Viewer' },
      { value: 'editor', text: 'Editor' },
    ];

    const { find, instance, fixture } = await shallow.render({
      bind: { linkTypes },
    });

    instance.displayDropdown = true;
    fixture.detectChanges();

    const options = find('.option');

    expect(options.length).toBe(linkTypes.length);
    expect(options[0].nativeElement.textContent).toContain('Viewer');
    expect(options[1].nativeElement.textContent).toContain('Editor');
  });

  it('should toggle dropdown visibility when clicked', async () => {
    const { fixture, find, instance } = await shallow.render();
    const dropdown = find('.share-link-type-dropdown');

    fixture.detectChanges();

    expect(instance.displayDropdown).toBe(false);

    dropdown.triggerEventHandler('click');
    fixture.detectChanges();

    expect(instance.displayDropdown).toBe(true);
  });

  it('should emit value and update display when option is clicked', async () => {
    const linkTypes = [
      { value: 'viewer', text: 'Viewer' },
      { value: 'editor', text: 'Editor' },
    ];

    const { instance, find, outputs, fixture } = await shallow.render({
      bind: { linkTypes },
    });

    instance.displayDropdown = true;

    fixture.detectChanges();

    const viewerOption = find('.option')[0];
    viewerOption.triggerEventHandler('click');
    fixture.detectChanges();

    expect(instance.displayDropdown).toBe(false);
    expect(instance.displayedValue).toBe('Viewer');
    expect(outputs.valueChange.emit).toHaveBeenCalledWith('viewer');
  });

  it('should show initial displayedValue based on selected value', async () => {
    const linkTypes = [
      { value: 'viewer', text: 'Viewer' },
      { value: 'editor', text: 'Editor' },
    ];

    const { find } = await shallow.render({
      bind: { value: 'editor', linkTypes },
    });

    expect(
      find('.share-link-type-dropdown').nativeElement.textContent,
    ).toContain('Access');
  });
});
