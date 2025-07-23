/* @format */
import { Shallow } from 'shallow-render';
import { PublicModule } from '@public/public.module';
import { ApiService } from '@shared/services/api/api.service';
import { SearchBoxComponent } from './search-box.component';

describe('SearchBoxComponent', () => {
	let shallow: Shallow<SearchBoxComponent>;

	beforeEach(() => {
		shallow = new Shallow(SearchBoxComponent, PublicModule);
		shallow.mock(ApiService, {});
	});

	it('should exist', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});
});
