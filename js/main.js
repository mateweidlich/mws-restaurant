window.addEventListener('load', () => {
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
	document.addEventListener('click', () => {
		document.getElementsByTagName('body')[0].classList.remove('show-focus-outlines');
	});

	/**
	 * Activate map
	 */
	document.getElementById('map').addEventListener('click', window.initMap);
});

/**
 * Set items tabindex for accessibility.
 */
window.setTabindex = () => {
	['a', 'select', 'button'].forEach(tag => {
		Array.prototype.slice.call(document.getElementsByTagName(tag)).forEach(element => {
			element.tabIndex = 0;
		});
	});
};

/**
 * Get a parameter by name from page URL.
 */
window.getParameterByName = (name, url) => {
	if (!url)
		url = window.location.href;
	name = name.replace(/[[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

if (navigator.serviceWorker) {
	navigator.serviceWorker.register('sw.js').then(() => window.console.log('Service worker operational!'));
}