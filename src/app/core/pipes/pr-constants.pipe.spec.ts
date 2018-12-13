import { PrConstantsPipe } from './pr-constants.pipe';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

const prConstants = new PrConstantsService();

describe('PrConstantsPipe', () => {
  it('create an instance', () => {
    const pipe = new PrConstantsPipe(prConstants);
    expect(pipe).toBeTruthy();
  });
});
