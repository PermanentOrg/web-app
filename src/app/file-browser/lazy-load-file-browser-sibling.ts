/* @format */
export const LazyLoadFileBrowserSibling = () =>
	import('./file-browser.module').then((m) => m.FileBrowserModule);
