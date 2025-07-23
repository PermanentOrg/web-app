import { PrependProtocolPipe } from './prepend-protocol.pipe';

describe('PrependProtocolPipe', () => {
	let pipe: PrependProtocolPipe;

	beforeEach(() => {
		pipe = new PrependProtocolPipe();
	});

	it('create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('prepends https:// to a url', () => {
		const url = 'www.example.com';
		const result = pipe.transform(url);

		expect(result).toBe('https://www.example.com');
	});

	it('does not prepend the protocol to an url that already has it', () => {
		const url = 'https://www.example.com';
		const result = pipe.transform(url);

		expect(result).toBe('https://www.example.com');
	});
});
