// =============================================
// CAD Model Viewer Logic
// - Loads CAD model metadata from JSON
// - Renders <model-viewer> cards dynamically
// - Provides filter + search interactions
// - Handles loading, empty, and error states
// =============================================

window.initCadPortfolio = function () {
	const grid = document.getElementById('cad-grid');
	if (!grid) return;
	const wrapper = document.querySelector('.cad-grid-wrapper');

	const statusElements = {
		loading: document.getElementById('cad-loading'),
		error: document.getElementById('cad-error'),
		empty: document.getElementById('cad-empty')
	};
	let allModels = [];
	let wheelHandlerInstalled = false;
	let scrollAnimationFrameId = 0;
	let targetScrollTop = 0;

	function createElement(tag, className = '', attrs = {}) {
		const el = document.createElement(tag);
		if (className) el.className = className;
		Object.entries(attrs).forEach(([key, value]) => {
			el.setAttribute(key, value);
		});
		return el;
	}

	function createModelId(value) {
		return String(value || 'model')
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'model';
	}

	function setStatus(status) {
		Object.entries(statusElements).forEach(([key, el]) => {
			if (el) el.hidden = key !== status;
		});
	}

	function createMetaChip(text) {
		const chip = createElement('span', 'cad-meta-chip');
		chip.textContent = String(text);
		return chip;
	}

	function clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	function getMaxScrollTop() {
		return Math.max(0, wrapper.scrollHeight - wrapper.clientHeight);
	}

	function normalizeWheelDelta(event) {
		if (!wrapper) return 0;

		if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
			return event.deltaY * wrapper.clientHeight;
		}

		if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
			return event.deltaY * 16;
		}

		return event.deltaY;
	}

	function animateWrapperScroll() {
		if (!wrapper) return;

		const currentScrollTop = wrapper.scrollTop;
		const delta = targetScrollTop - currentScrollTop;

		if (Math.abs(delta) < 0.5) {
			wrapper.scrollTop = targetScrollTop;
			scrollAnimationFrameId = 0;
			return;
		}

		wrapper.scrollTop = currentScrollTop + delta * 0.2;
		scrollAnimationFrameId = window.requestAnimationFrame(animateWrapperScroll);
	}

	function setupGlobalWheel() {
		if (!wrapper || wheelHandlerInstalled) return;
		wheelHandlerInstalled = true;
		targetScrollTop = wrapper.scrollTop;

		document.addEventListener('wheel', (event) => {
			const target = event.target instanceof Element ? event.target : null;
			if (target && target.closest('model-viewer')) return;

			const deltaY = normalizeWheelDelta(event);
			if (!deltaY) return;

			event.preventDefault();
			targetScrollTop = clamp(targetScrollTop + deltaY, 0, getMaxScrollTop());

			if (!scrollAnimationFrameId) {
				scrollAnimationFrameId = window.requestAnimationFrame(animateWrapperScroll);
			}
		}, { passive: false, capture: true });
	}

	async function loadModels() {
		try {
			setStatus('loading');
			const response = await fetch('assets/cad/models.json', {
				cache: 'no-cache'
			});

			if (!response.ok) throw new Error('Network response was not ok');

			const data = await response.json();
			allModels = Array.isArray(data.models) ? data.models : [];
			render();
		} catch (err) {
			console.error('Failed to load CAD models:', err);
			setStatus('error');
		}
	}

	function render() {
		grid.innerHTML = '';

		if (!allModels.length) {
			setStatus('empty');
			return;
		}

		setStatus('idle');
		const fragment = document.createDocumentFragment();
		allModels.forEach((model) => {
			fragment.appendChild(createCard(model));
		});
		grid.appendChild(fragment);
	}

	function createCard(model) {
		const {
			id,
			title,
			description,
			software,
			file,
			sizeMB,
			metadata = {},
			controlsHint = '',
			tags = []
		} = model;

		const safeId = createModelId(id || title);
		const safeTitle = String(title || 'CAD Model');
		const safeDescription = String(description || 'Mechanical CAD model visualized for the web.');
		const safeSoftware = String(software || 'Other');
		const safeFile = String(file || '');
		const controlsHintText = String(controlsHint || '').trim();

		// Card container
		const card = createElement('article', 'cad-card', {
			'data-id': safeId,
			'data-software': safeSoftware.toLowerCase(),
			tabindex: '0',
			'aria-labelledby': safeId + '-title'
		});

		// Viewer wrapper with model-viewer and overlays
		const viewerWrapper = createElement('div', 'cad-viewer-wrapper');
		const modelViewer = createElement('model-viewer', '', {
			src: safeFile,
			alt: safeTitle + ' 3D model',
			loading: 'lazy',
			'camera-controls': '',
			'touch-action': 'pan-y',
			'shadow-intensity': '0.8',
			exposure: '0.9',
			'environment-image': 'neutral'
		});

		const overlay = createElement('div', 'cad-viewer-overlay');
		overlay.innerHTML = '<span class="spinner" aria-hidden="true"></span><span class="cad-viewer-hint">Loading 3D preview…</span>';

		const errorOverlay = createElement('div', 'cad-viewer-error');
		errorOverlay.textContent = 'Model preview failed to load. The file may be missing or too large.';

		modelViewer.addEventListener('load', () => overlay.classList.add('hidden'));
		modelViewer.addEventListener('error', () => errorOverlay.classList.add('visible'));

		viewerWrapper.append(modelViewer, overlay, errorOverlay);

		// Header with title and software badge
		const header = createElement('div', 'cad-card-header');
		const titleEl = createElement('h2', 'cad-title', { id: safeId + '-title' });
		titleEl.textContent = safeTitle;
		const badge = createElement('span', 'cad-software-badge');
		badge.textContent = safeSoftware;
		header.append(titleEl, badge);

		// Description
		const descEl = createElement('p', 'cad-description');
		descEl.textContent = safeDescription;

		// Metadata row
		const metaRow = createElement('div', 'cad-meta');
		['category', 'material', 'year'].forEach((key) => {
			if (metadata[key]) {
				metaRow.appendChild(createMetaChip(key === 'year' ? String(metadata[key]) : metadata[key]));
			}
		});

		// Footer row
		const footerRow = createElement('div', 'cad-footer-row');

		if (controlsHintText) {
			const hint = createElement('p', 'cad-controls-hint');
			hint.textContent = controlsHintText;
			footerRow.appendChild(hint);
		} else if (tags.length > 0) {
			const tagContainer = createElement('div', 'cad-tags');
			tags.slice(0, 4).forEach((tag) => {
				const span = createElement('span', 'cad-tag');
				span.textContent = String(tag);
				tagContainer.appendChild(span);
			});
			footerRow.appendChild(tagContainer);
		}

		const sizeIndicator = createElement('span', 'cad-size-indicator');
		sizeIndicator.textContent = typeof sizeMB === 'number' ? `${sizeMB.toFixed(1)} MB` : '< 10 MB';
		footerRow.appendChild(sizeIndicator);

		// Assemble card
		card.append(viewerWrapper, header, descEl, metaRow, footerRow);
		return card;
	}

	loadModels();
	setupGlobalWheel();
};

