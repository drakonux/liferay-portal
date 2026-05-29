// Mark the navigation item matching the current page as active.
// Links are relative (home / components / styles), so compare against
// the last path segment of the current URL.
(function () {
	var nav = fragmentElement.querySelector('.govuk-service-navigation');

	if (!nav) {
		return;
	}

	var segments = window.location.pathname.replace(/\/+$/, '').split('/');
	var current = segments[segments.length - 1] || 'home';

	var links = nav.querySelectorAll('.govuk-service-navigation__list .govuk-service-navigation__link');

	links.forEach(function (link) {
		var target = (link.getAttribute('href') || '').replace(/^\/+/, '');

		if (target === current) {
			link.parentNode.classList.add('govuk-service-navigation__item--active');
		}
	});
})();
