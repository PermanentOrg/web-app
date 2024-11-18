/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { FolderVO, RecordVO } from '@models/index';
import { PublicSearchBarResultsComponent } from './public-search-bar-results.component';

describe('PublicSearchBarResultsComponent', () => {
  let component: PublicSearchBarResultsComponent;
  let fixture: ComponentFixture<PublicSearchBarResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicSearchBarResultsComponent],
      imports: [RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicSearchBarResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit "search" when viewAllResults is called', () => {
    spyOn(component.search, 'emit');

    component.viewAllResults();

    expect(component.search.emit).toHaveBeenCalled();
  });

  it('should emit tagClickOutput with the correct tag when onTagClick is called', () => {
    const testTag = { name: 'Test Tag' };
    spyOn(component.tagClickOutput, 'emit');

    component.onTagClick(testTag);

    expect(component.tagClickOutput.emit).toHaveBeenCalledWith([testTag]);
  });

  it('should navigate to folder route when goToFile is called with a public folder', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    const testItem = {
      type: 'type.folder.public',
      archiveNbr: 123,
      folder_linkId: 456,
    };

    component.goToFile(new FolderVO(testItem));

    expect(routerSpy).toHaveBeenCalledWith([123, 456], {
      relativeTo: component['route'],
    });
  });

  it('should navigate to record route when goToFile is called with a record item', () => {
    const routerSpy = spyOn(component['router'], 'navigate');
    const testItem = {
      type: 'type.record.image',
      archiveNbr: '789',
    };

    component.goToFile(new RecordVO(testItem));

    expect(routerSpy).toHaveBeenCalledWith(['record', '789'], {
      relativeTo: component['route'],
    });
  });

  it('should display search results when searchResults have items', () => {
    component.searchResults = [
      {
        thumbURL200: 'image1.png',
        displayName: 'Image 1',
        type: 'type.record.image',
      },
    ];
    fixture.detectChanges();

    const resultElements = fixture.debugElement.queryAll(By.css('.result'));

    expect(resultElements.length).toBe(1);
    expect(resultElements[0].nativeElement.textContent).toContain('Image 1');
  });

  it('should display tags when tags are provided', () => {
    component.tags = [{ name: 'Tag 1' }, { name: 'Tag 2' }];
    fixture.detectChanges();

    const tagElements = fixture.debugElement.queryAll(By.css('.tag'));

    expect(tagElements.length).toBe(2);
    expect(tagElements[0].nativeElement.textContent).toContain('Tag 1');
    expect(tagElements[1].nativeElement.textContent).toContain('Tag 2');
  });

  it('should not display search results section when searchResults is empty', () => {
    component.searchResults = [];
    fixture.detectChanges();

    const searchResultsSection = fixture.debugElement.query(
      By.css('.search-results'),
    );

    expect(searchResultsSection).toBeNull();
  });

  it('should not display tag results section when tags array is empty', () => {
    component.tags = [];
    fixture.detectChanges();

    const tagResultsSection = fixture.debugElement.query(
      By.css('.tag-results'),
    );

    expect(tagResultsSection).toBeNull();
  });
});
