/**
 * Add outlines for elements if user is using TAB key
 */
document.addEventListener('keydown', (e) => {
	if (e.keyCode === 9) {
		document.getElementsByTagName('body')[0].classList.add('show-focus-outlines');
	}
});

/**
 * Remove outlines for elements if user is using mouse click
 */
document.addEventListener('click', (e) => {
	document.getElementsByTagName('body')[0].classList.remove('show-focus-outlines');
});

/**
 * Set items tabindex for accessibility.
 */
setTabindex = () => {
	['h1', 'h2', 'p', 'span', 'img', 'td'].forEach(tag => {
		Array.prototype.slice.call(document.getElementsByTagName(tag)).forEach(element => {
			element.tabIndex = 0;
		});
	});
}

if (navigator.serviceWorker) {
	navigator.serviceWorker.register('sw.js').then(() => console.log('Service worker operational!'));
}