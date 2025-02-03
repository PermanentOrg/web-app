import { TaskLinkPipe } from './task-link.pipe';

describe('TaskLinkPipe', () => {
  let pipe: TaskLinkPipe;

  beforeEach(() => {
    pipe = new TaskLinkPipe();
  });

  it('should return null for an undefined task', () => {
    expect(pipe.transform('not-a-valid-task-ever')).toBeUndefined();
  });

  it('should return a route for a defined task', () => {
    expect(pipe.transform('storageRedeemed')).not.toBeUndefined();
  });
});
