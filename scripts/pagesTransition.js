// Centralized page + portal transition logic
(function () {
	const ANIM_LINK_ID = "anim-style";
	const RESPONSIVE_LINK_ID = "responsive-style";
	const INSERT_DELAY_MS = 140;
	const LANGUAGE_TRANSITION_MS = 700;

	function safeGetElement(id) {
		if (!id) return null;
		return document.getElementById(id);
	}

	function fadeOutShell(options) {
		const { container, header, footer } = options || {};
		[container, header, footer].forEach(el => {
			if (el) el.classList.remove("loaded");
		});
	}

	function fadeInShell(options) {
		const { container, header, footer } = options || {};
		setTimeout(() => {
			[container, header, footer].forEach(el => {
				if (el) el.classList.add("loaded");
			});
		}, INSERT_DELAY_MS);
	}

	function beforePageTransition(options) {
		const { portal, nextPage } = options || {};

		if (portal && document.body.classList.contains("home-active") && nextPage !== "home") {
			document.body.classList.add("portal-fade-out");
		}
	}

	function afterFadeOut(options) {
		const { portal, nextPage } = options || {};

		if (portal && nextPage !== "home") {
			portal.classList.add("portal-hidden");
			portal.style.display = "none";
			document.body.classList.remove("home-active", "portal-fade-out");
		}
	}

	function restartPortalAnimations(portal) {
		if (!portal) return;

		const animationRoot = portal.querySelector(".home-portal-animation");
		if (!animationRoot || !animationRoot.parentNode) return;

		// Replace the animation root node with a cloned copy so that
		// all CSS keyframe animations (motion rings + bearing/cogwheel)
		// reliably restart when returning to the Home page, including on
		// mobile browsers where animations can remain paused after a
		// display:none toggle.
		const clone = animationRoot.cloneNode(true);
		animationRoot.parentNode.replaceChild(clone, animationRoot);
	}

	function enablePortal(portal) {
		if (!portal) return;
		restartPortalAnimations(portal);
		portal.style.display = "block";
		portal.classList.remove("portal-hidden");
		document.body.classList.remove("portal-fade-out");

		// Stage class toggle to the next paint so opacity can animate from 0 -> 1
		// even when the portal was previously display:none.
		document.body.classList.remove("home-active");
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document.body.classList.add("home-active");
			});
		});
	}

	function onHomePageLoaded(options) {
		const { portal, animationHref, nextPage } = options || {};
		if (!portal || nextPage !== "home") return;

		if (animationHref) {
			// Reuse the existing anim-style link if present (declared in index.html),
			// otherwise create it. This avoids duplicate IDs and makes sure we
			// can reliably re-enable the portal when navigating back to Home.
			let animLink = safeGetElement(ANIM_LINK_ID);
			let isNew = false;
			if (!animLink) {
				animLink = document.createElement("link");
				animLink.rel = "stylesheet";
				animLink.id = ANIM_LINK_ID;
				isNew = true;
			}

			const activatePortal = () => {
				enablePortal(portal);
				const responsiveLink = safeGetElement(RESPONSIVE_LINK_ID);
				if (responsiveLink && responsiveLink.parentNode) {
					responsiveLink.parentNode.removeChild(responsiveLink);
					document.head.appendChild(responsiveLink);
				}
			};

			// If the href is changing, wait for the new stylesheet to load
			// before enabling the portal. If it's already the same (e.g. user
			// navigated away and back), enable immediately so mobile devices
			// don't end up with a hidden, non-animated portal.
			const currentHref = animLink.getAttribute("href");
			if (currentHref !== animationHref) {
				animLink.onload = () => {
					animLink.onload = null;
					activatePortal();
				};
				animLink.href = animationHref;
			} else {
				activatePortal();
			}

			if (isNew || !animLink.parentNode) {
				document.head.appendChild(animLink);
			}
		} else {
			enablePortal(portal);
		}
	}

	const translations = {
		en: {
			name: "Predrag Milanović",
			intro: "Hi, my name is",
			tagline: "and I'm a Mechanical and IT Engineer",
			linkedin: "LinkedIn",
			github: "GitHub",
			cv: "CV",
			cadPortfolio: "CAD Portfolio",
			cadHeaderTitle: "CAD Portfolio",
			cadHeaderSubtitle:
				"A selection of 3D CAD models developed throughout my engineering career.",
			cadHeaderHome: "Home",
			blog: "Blog",
			cvPath: "assets/cv/predrag-milanovic-cv.pdf",
			showBlog: true
		},
		de: {
			name: "Predrag Milanović",
			intro: "Hallo, mein Name ist",
			tagline: "ich bin Maschinenbau- und IT-Ingenieur",
			linkedin: "LinkedIn",
			github: "GitHub",
			cv: "Lebenslauf",
			cadPortfolio: "CAD Portfolio",
			cadHeaderTitle: "CAD-Portfolio",
			cadHeaderSubtitle:
				"Eine Auswahl von 3D-CAD-Modellen aus meiner bisherigen Ingenieurlaufbahn.",
			cadHeaderHome: "Home",
			blog: "Blog",
			cvPath: "assets/cv/predrag-milanovic-lebenslauf.pdf",
			showBlog: false
		}
	};

	function applyLanguageSpecificStyling(language, socialsContainer) {
		const body = document.body;
		const pageContainer = document.querySelector(".page-container");

		body.classList.remove("lang-en", "lang-de");
		body.classList.add(`lang-${language}`);

		if (language === "de") {
			if (socialsContainer) {
				socialsContainer.style.transition = "gap 0.3s ease, justify-content 0.3s ease";
				socialsContainer.style.justifyContent = "center";
				socialsContainer.style.gap = "2rem";
			}

			if (pageContainer) {
				pageContainer.style.transition = "max-width 0.3s ease";
				pageContainer.style.maxWidth = "700px";
			}
		} else {
			if (socialsContainer) {
				socialsContainer.style.transition = "gap 0.3s ease, justify-content 0.3s ease";
				socialsContainer.style.justifyContent = "";
				socialsContainer.style.gap = "";
			}

			if (pageContainer) {
				pageContainer.style.transition = "max-width 0.3s ease";
				pageContainer.style.maxWidth = "";
			}
		}
	}

	function applyTranslations(language, withAnimation = true) {
		const trans = translations[language];
		if (!trans) return;

		const textElements = [
			{ el: document.querySelector(".name"), text: trans.name },
			{ el: document.querySelector(".intro"), text: trans.intro },
			{ el: document.querySelector(".tagline"), text: trans.tagline },
			{ el: document.querySelector("#cad-page-title"), text: trans.cadHeaderTitle },
			{ el: document.querySelector(".cad-subtitle"), text: trans.cadHeaderSubtitle },
			{ el: document.querySelector(".cad-back-link"), text: trans.cadHeaderHome }
		];

		const socialElements = [
			{ el: document.querySelector('a[href*="linkedin"] span'), text: trans.linkedin },
			{ el: document.querySelector('a[href*="github"] span'), text: trans.github },
			{ el: document.querySelector('a[href*="cv"] span'), text: trans.cv },
			{ el: document.querySelector('a[href="#cad-portfolio"] span'), text: trans.cadPortfolio }
		];

		const iconElements = [
			document.querySelector('a[href*="linkedin"] .icon'),
			document.querySelector('a[href*="github"] .icon'),
			document.querySelector('a[href*="cv"] .icon'),
			document.querySelector('a[href="#blog"] .icon'),
			document.querySelector('a[href="#cad-portfolio"] .icon')
		].filter(Boolean);

		const cadPage = document.querySelector(".cad-page");
		const cvLink = document.querySelector('a[href*="cv"]');
		const blogBox = document.querySelector('a[href="#blog"]')?.closest(".social-box");
		const socialsContainer = document.querySelector(".socials-container");

		if (withAnimation) {
			const allElements = [...textElements, ...socialElements]
				.map(item => item.el)
				.filter(Boolean);
			const allAnimatedElements = [...allElements, ...iconElements];
			const fadeTargets = [...allAnimatedElements];
			if (cadPage && !fadeTargets.includes(cadPage)) {
				fadeTargets.push(cadPage);
			}

			fadeTargets.forEach(el => {
				if (el) {
					el.style.transition = `opacity ${LANGUAGE_TRANSITION_MS}ms ease`;
					el.style.opacity = "0";
				}
			});

			if (blogBox && !trans.showBlog) {
				blogBox.style.transition = `opacity ${LANGUAGE_TRANSITION_MS}ms ease`;
				blogBox.style.opacity = "0";
			}

			setTimeout(() => {
				textElements.forEach(({ el, text }) => {
					if (el) el.textContent = text;
				});

				socialElements.forEach(({ el, text }) => {
					if (el) el.textContent = text;
				});

				if (cvLink) {
					cvLink.href = trans.cvPath;
				}

				if (blogBox) {
					if (trans.showBlog) {
						blogBox.style.display = "flex";
						setTimeout(() => {
							blogBox.style.opacity = "1";
						}, 50);
					} else {
						blogBox.style.display = "none";
					}
				}

				applyLanguageSpecificStyling(language, socialsContainer);

				setTimeout(() => {
					fadeTargets.forEach(el => {
						if (el) {
							el.style.opacity = "1";
						}
					});

					if (blogBox && trans.showBlog) {
						blogBox.style.opacity = "1";
					}
				}, 50);
			}, LANGUAGE_TRANSITION_MS);
		} else {
			textElements.forEach(({ el, text }) => {
				if (el) el.textContent = text;
			});

			socialElements.forEach(({ el, text }) => {
				if (el) el.textContent = text;
			});

			if (cvLink) {
				cvLink.href = trans.cvPath;
			}

			if (blogBox) {
				blogBox.style.display = trans.showBlog ? "flex" : "none";
			}

			applyLanguageSpecificStyling(language, socialsContainer);
		}
	}

	window.portalAnimation = {
		beforePageTransition,
		afterFadeOut,
		onHomePageLoaded
	};

	window.pageTransition = {
		fadeOutShell,
		fadeInShell,
		applyTranslations,
		applyLanguageSpecificStyling
	};
})();
