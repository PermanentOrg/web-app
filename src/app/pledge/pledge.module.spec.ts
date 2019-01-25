import { PledgeModule } from './pledge.module';

describe('PledgeModule', () => {
  let pledgeModule: PledgeModule;

  beforeEach(() => {
    pledgeModule = new PledgeModule();
  });

  it('should create an instance', () => {
    expect(pledgeModule).toBeTruthy();
  });
});
