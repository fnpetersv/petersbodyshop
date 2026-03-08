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

	// ----- About page: FAQ accordion (only one open at a time) -----
	var faqList = document.querySelector('.about-faq__list');
	if (faqList) {
		var faqItems = faqList.querySelectorAll('.about-faq__item');
		faqItems.forEach(function (details) {
			details.addEventListener('toggle', function () {
				if (details.open) {
					faqItems.forEach(function (other) {
						if (other !== details) other.removeAttribute('open');
					});
				}
			});
		});
	}

	// ----- About page: testimonial carousel -----
	var carousel = document.querySelector('[data-testimonial-carousel]');
	if (carousel) {
		var track = carousel.querySelector('.testimonial-carousel__track');
		var cards = carousel.querySelectorAll('.testimonial-card');
		var prev = carousel.querySelector('.testimonial-carousel__btn--prev');
		var next = carousel.querySelector('.testimonial-carousel__btn--next');
		var dotsContainer = carousel.querySelector('.testimonial-carousel__dots');
		var num = cards.length;
		var idx = 0;

		function setSlide(i) {
			if (i < 0) i = num - 1;
			if (i >= num) i = 0;
			idx = i;
			var pct = num > 0 ? (idx * 100 / num) : 0;
			if (track) track.style.transform = 'translateX(-' + pct + '%)';
			cards.forEach(function (card, j) {
				card.classList.toggle('active', j === idx);
			});
			if (dotsContainer) {
				var dots = dotsContainer.querySelectorAll('li');
				dots.forEach(function (dot, j) {
					dot.classList.toggle('active', j === idx);
					var btn = dot.querySelector('button');
					if (btn) btn.setAttribute('aria-current', j === idx ? 'true' : null);
				});
			}
		}

		if (dotsContainer && num > 0) {
			for (var d = 0; d < num; d++) {
				var li = document.createElement('li');
				li.classList.toggle('active', d === 0);
				var btn = document.createElement('button');
				btn.setAttribute('aria-label', 'Go to testimonial ' + (d + 1));
				btn.setAttribute('aria-current', d === 0 ? 'true' : null);
				btn.addEventListener('click', function (k) { return function () { setSlide(k); }; }(d));
				li.appendChild(btn);
				dotsContainer.appendChild(li);
			}
		}
		if (prev) prev.addEventListener('click', function () { setSlide(idx - 1); });
		if (next) next.addEventListener('click', function () { setSlide(idx + 1); });
		setSlide(0);
	}

	// ----- Estimates page: form submit (show success; set form action for real backend) -----
	var estimateForm = document.getElementById('estimate-form');
	if (estimateForm) {
		var estimateError = document.getElementById('estimate-error');
		var estimateSuccess = document.getElementById('estimate-success');
		estimateForm.addEventListener('submit', function (e) {
			if (!estimateForm.action || estimateForm.action === '' || estimateForm.getAttribute('action') === '') {
				e.preventDefault();
				if (estimateError) estimateError.hidden = true;
				if (estimateSuccess) estimateSuccess.hidden = false;
				estimateForm.reset();
			} else {
				if (estimateError) estimateError.hidden = true;
				if (estimateSuccess) estimateSuccess.hidden = true;
			}
		});
	}

	// ----- Careers page: form submit -----
	var careersForm = document.getElementById('careers-form');
	if (careersForm) {
		var careersError = document.getElementById('careers-error');
		var careersSuccess = document.getElementById('careers-success');
		careersForm.addEventListener('submit', function (e) {
			if (!careersForm.action || careersForm.action === '' || careersForm.getAttribute('action') === '') {
				e.preventDefault();
				if (careersError) careersError.hidden = true;
				if (careersSuccess) careersSuccess.hidden = false;
				careersForm.reset();
			} else {
				if (careersError) careersError.hidden = true;
				if (careersSuccess) careersSuccess.hidden = true;
			}
		});
	}
})();
