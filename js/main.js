(function () {
	'use strict';

	// ----- Sticky header -----
	var header = document.getElementById('header');
	if (header) {
		var stickyHeight = 80;
		function checkSticky() {
			header.classList.toggle('is-sticky', window.pageYOffset > stickyHeight);
		}
		window.addEventListener('scroll', checkSticky, { passive: true });
		checkSticky();
	}

	// ----- Mobile nav toggle -----
	var navToggle = document.querySelector('.nav-toggle');
	var nav = document.getElementById('nav');
	if (navToggle && nav) {
		navToggle.addEventListener('click', function () {
			var open = nav.classList.toggle('is-open');
			navToggle.setAttribute('aria-expanded', open);
			header && header.classList.toggle('menu-open', open);
			document.body.style.overflow = open ? 'hidden' : '';
		});
		nav.querySelectorAll('a').forEach(function (link) {
			link.addEventListener('click', function () {
				nav.classList.remove('is-open');
				navToggle && navToggle.setAttribute('aria-expanded', 'false');
				header && header.classList.remove('menu-open');
				document.body.style.overflow = '';
			});
		});
	}

	// ----- Certifications fade slider (vanilla JS, offset start per track) -----
	var certSliders = document.querySelectorAll('[data-slider]');
	var CERT_INTERVAL = 3500;
	certSliders.forEach(function (slider, trackIndex) {
		var track = slider.querySelector('.cert-fade-slider__track');
		if (!track) return;
		var slides = [].slice.call(track.querySelectorAll('.cert-fade-slider__slide'));
		if (slides.length === 0) return;
		var count = Math.min(9, slides.length);
		slides = slides.slice(0, count);
		var offset = Math.max(1, Math.floor(slides.length / certSliders.length));
		var current = (trackIndex * offset) % slides.length;
		slides.forEach(function (s, i) {
			s.classList.toggle('active', i === current);
		});
		setInterval(function () {
			slides[current].classList.remove('active');
			current = (current + 1) % slides.length;
			slides[current].classList.add('active');
		}, CERT_INTERVAL);
	});

	// ----- 6-step process carousel (lightweight, no Bootstrap) -----
	var processSlides = document.querySelectorAll('.process-slide');
	var indicators = document.querySelectorAll('.process-indicators li');
	var prevBtn = document.querySelector('.process-prev');
	var nextBtn = document.querySelector('.process-next');
	var total = processSlides.length;
	var currentIndex = 0;

	function goTo(index) {
		if (index < 0) index = total - 1;
		if (index >= total) index = 0;
		currentIndex = index;
		processSlides.forEach(function (slide, i) {
			slide.classList.toggle('active', i === currentIndex);
		});
		indicators.forEach(function (ind, i) {
			ind.classList.toggle('active', i === currentIndex);
			ind.setAttribute('aria-current', i === currentIndex ? 'true' : null);
		});
	}

	if (processSlides.length && indicators.length) {
		prevBtn && prevBtn.addEventListener('click', function () { goTo(currentIndex - 1); });
		nextBtn && nextBtn.addEventListener('click', function () { goTo(currentIndex + 1); });
		indicators.forEach(function (ind, i) {
			ind.addEventListener('click', function () { goTo(i); });
		});
		goTo(0);
	}
})();
