export const LazyLoadFileBrowserSibling = async () =>
	await import('./file-browser.module').then((m) => m.FileBrowserModule);
