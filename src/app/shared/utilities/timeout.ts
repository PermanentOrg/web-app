export async function timeout(t: number = 0) {
	return await new Promise((resolve) => setTimeout(resolve, t));
}
