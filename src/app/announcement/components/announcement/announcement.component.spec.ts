/* @format */
import { DebugElement } from '@angular/core';
import { Shallow } from 'shallow-render';
import { QueryMatch } from 'shallow-render/dist/lib/models/query-match';

import { AnnouncementModule } from '@announcement/announcement.module';
import { AnnouncementEvent } from '@announcement/models/announcement-event';
import { AnnouncementComponent } from './announcement.component';

const currentTestEvent: AnnouncementEvent = {
  start: Date.now(),
  end: Date.now() + 24 * 60 * 60 * 1000,
  message: 'Test Event!!!',
};

const pastTestEvent: AnnouncementEvent = {
  start: 1,
  end: 2,
  message: 'Past: This should not show up!',
};

const futureTestEvent: AnnouncementEvent = {
  start: Date.now() + 24 * 60 * 60 * 1000,
  end: Infinity,
  message: 'Future: This should not show up!',
};

Object.freeze(currentTestEvent);
Object.freeze(pastTestEvent);
Object.freeze(futureTestEvent);

describe('AnnouncementComponent', () => {
  let shallow: Shallow<AnnouncementComponent>;
  async function defaultRender(events?: AnnouncementEvent[]) {
    return await shallow.render(
      `<pr-announcement [eventsList]="events"></pr-announcement>`,
      {
        bind: {
          events,
        },
      }
    );
  }
  beforeEach(() => {
    shallow = new Shallow(AnnouncementComponent, AnnouncementModule);
  });
  afterEach(() => {
    window.localStorage.clear();
  });
  it('should exist', async () => {
    expect(shallow).not.toBeNull();
  });
  it('should take in test data', async () => {
    const { element } = await defaultRender([currentTestEvent]);

    expect(element).not.toBeNull();
  });
  it('should display the message', async () => {
    const { find, element } = await defaultRender([currentTestEvent]);

    expect(find('.announcement').length).toBeGreaterThan(0);
    expect(element.nativeElement.innerText).toContain('Test Event!!!');
  });
  it('should hide itself if event is in the future', async () => {
    const { find } = await defaultRender([futureTestEvent]);

    expect(find('.announcement').length).toBe(0);
  });
  it('should hide itself if the event is already over', async () => {
    const { find } = await defaultRender([pastTestEvent]);

    expect(find('.announcement').length).toBe(0);
  });
  it('should support multiple event definitions', async () => {
    const { find, element } = await defaultRender([
      pastTestEvent,
      currentTestEvent,
      futureTestEvent,
    ]);

    expect(find('.announcement').length).toBe(1);
    expect(element.nativeElement.innerText).toContain('Test Event!!!');
  });
  it('should be dismissable', async () => {
    const { find, fixture, element } = await defaultRender([currentTestEvent]);

    expect(find('.dismiss-button').length).toBe(1);
    find('.dismiss-button').nativeElement.click();
    fixture.detectChanges();

    expect(find('.announcement').length).toBe(0);
  });
  it('should set dismissed setting in localStorage', async () => {
    const { find, fixture, instance } = await defaultRender([currentTestEvent]);

    expect(find('.dismiss-button').length).toBe(1);
    find('.dismiss-button').nativeElement.click();
    fixture.detectChanges();

    expect(window.localStorage.getItem('announcementDismissed')).toBe(
      currentTestEvent.start.toString()
    );
  });
  it('should recall dismissed setting from localStorage', async () => {
    window.localStorage.setItem(
      'announcementDismissed',
      currentTestEvent.start.toString()
    );
    const { find } = await defaultRender([currentTestEvent]);

    expect(find('.announcement').length).toBe(0);
  });
  it('should still be able to show a new announcement after dismissing a previous one', async () => {
    window.localStorage.setItem('announcementDismissed', 'pastevent');
    const { find } = await defaultRender([currentTestEvent]);

    expect(find('.announcement').length).toBe(1);
  });
  it('should be able to handle an empty data array', async () => {
    const { find } = await defaultRender([]);

    expect(find('.announcement').length).toBe(0);
  });
  it('should be able to handle the null case', async () => {
    const { find } = await defaultRender();

    expect(find('.announcement').length).toBe(0);
  });
  describe('Layout Adjustment', () => {
    async function renderWithAdjustables() {
      return await shallow.render(
        `<div class="adjust-for-announcement"></div><pr-announcement [eventsList]="events"></pr-announcement><div class="adjust-for-announcement"></div>`,
        {
          bind: {
            events: [currentTestEvent],
          },
        }
      );
    }
    function getAdjustedElements(
      find: (s: string) => QueryMatch<DebugElement>
    ) {
      const adjustedElements = find('.adjust-for-announcement');

      expect(adjustedElements.length).toBeGreaterThan(0);
      return adjustedElements;
    }
    it('should adjust the page layout when it appears', async () => {
      const { find } = await renderWithAdjustables();
      getAdjustedElements(find).forEach((element) => {
        expect(element.nativeElement.style.paddingTop).not.toBe('0px');
        expect(element.nativeElement.style.paddingTop).not.toBeUndefined();
      });
    });
    it('should readjust the page layout when it disappears', async () => {
      const { find, fixture } = await renderWithAdjustables();
      find('.dismiss-button').nativeElement.click();
      fixture.detectChanges();
      getAdjustedElements(find).forEach((element) => {
        expect(element.nativeElement.style.paddingTop).toBe('0px');
      });
    });
  });
});
