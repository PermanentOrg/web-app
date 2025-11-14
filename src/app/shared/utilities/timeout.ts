export async function timeout(t: number = 0) {
	return await new Promise<void>((resolve) => {
		setTimeout(resolve, t);
	});
}
