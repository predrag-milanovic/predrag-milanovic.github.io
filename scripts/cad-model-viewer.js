// =============================================
// CAD Model Viewer Logic
// - Loads CAD model metadata from JSON
// - Renders <model-viewer> cards dynamically
// - Provides filter + search interactions
// - Handles loading, empty, and error states
// =============================================

// Public init function, called by main.js after the CAD page content is injected
window.initCadPortfolio = function () {
	const grid = document.getElementById('cad-grid');
	if (!grid) return; // Safety: only execute on CAD page when grid exists

	const loadingEl = document.getElementById('cad-loading');
	const errorEl = document.getElementById('cad-error');
	const emptyEl = document.getElementById('cad-empty');
	// Internal state
	let allModels = [];

	// Helper: update status visibility
	function setStatus({ loading = false, error = false, empty = false }) {
		if (loadingEl) loadingEl.hidden = !loading;
		if (errorEl) errorEl.hidden = !error;
		if (emptyEl) emptyEl.hidden = !empty;
	}

	// Helper: sanitize text for safe insertion
	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	// Fetch model data from JSON file
	async function loadModels() {
		try {
			setStatus({ loading: true, error: false, empty: false });

			const response = await fetch('assets/cad/models.json', {
				cache: 'no-cache'
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();
			allModels = Array.isArray(data.models) ? data.models : [];

			// Render initial state (no filter, empty search)
			render();
		} catch (err) {
			console.error('Failed to load CAD models:', err);
			setStatus({ loading: false, error: true, empty: false });
		} finally {
			if (loadingEl) loadingEl.hidden = true;
		}
	}

	// Render all cards into the grid
	function render() {
		// Clear previous content
		grid.innerHTML = '';

		if (!allModels.length) {
			setStatus({ loading: false, error: false, empty: true });
			return;
		}

		setStatus({ loading: false, error: false, empty: false });

		const fragment = document.createDocumentFragment();

		allModels.forEach((model) => {
			fragment.appendChild(createCard(model));
		});

		grid.appendChild(fragment);
	}

	// Create a single card node for a model
	function createCard(model) {
		const {
			id,
			title,
			description,
			software,
			file,
			sizeMB,
			metadata = {},
			tags = []
		} = model;

		const safeId = escapeHtml(id || title || 'model');
		const safeTitle = escapeHtml(title || 'CAD Model');
		const safeDescription = escapeHtml(
			description || 'Mechanical CAD model visualized for the web.'
		);
		const safeSoftware = escapeHtml(software || 'Other');
		const safeFile = escapeHtml(file || '');

		const card = document.createElement('article');
		card.className = 'cad-card';
		card.setAttribute('data-id', safeId);
		card.setAttribute('data-software', safeSoftware.toLowerCase());
		card.setAttribute('tabindex', '0');
		card.setAttribute('aria-labelledby', safeId + '-title');

		// Viewer wrapper with loading + error overlays
		const viewerWrapper = document.createElement('div');
		viewerWrapper.className = 'cad-viewer-wrapper';

		const modelViewer = document.createElement('model-viewer');
		modelViewer.setAttribute('src', safeFile);
		modelViewer.setAttribute('alt', safeTitle + ' 3D model');
		modelViewer.setAttribute('loading', 'lazy');
		modelViewer.setAttribute('camera-controls', '');
		modelViewer.setAttribute('touch-action', 'pan-y');
		modelViewer.setAttribute('shadow-intensity', '0.8');
		modelViewer.setAttribute('exposure', '0.9');
		modelViewer.setAttribute('environment-image', 'neutral');
		modelViewer.setAttribute('ar', '');
		modelViewer.setAttribute('disable-zoom', '');

		// Per-model loading overlay
		const overlay = document.createElement('div');
		overlay.className = 'cad-viewer-overlay';
		overlay.innerHTML =
			'<span class="spinner" aria-hidden="true"></span>' +
			'<span class="cad-viewer-hint">Loading 3D preview…</span>';

		// Error overlay
		const errorOverlay = document.createElement('div');
		errorOverlay.className = 'cad-viewer-error';
		errorOverlay.textContent =
			'Model preview failed to load. The file may be missing or too large.';

		// Model-viewer events for loading + error handling
		modelViewer.addEventListener('load', () => {
			overlay.classList.add('hidden');
		});

		modelViewer.addEventListener('error', () => {
			overlay.classList.add('hidden');
			errorOverlay.classList.add('visible');
		});

		viewerWrapper.appendChild(modelViewer);
		viewerWrapper.appendChild(overlay);
		viewerWrapper.appendChild(errorOverlay);

		// Text content
		const header = document.createElement('div');
		header.className = 'cad-card-header';

		const titleEl = document.createElement('h2');
		titleEl.className = 'cad-title';
		titleEl.id = safeId + '-title';
		titleEl.textContent = safeTitle;

		const badge = document.createElement('span');
		badge.className = 'cad-software-badge';
		badge.textContent = safeSoftware;

		header.appendChild(titleEl);
		header.appendChild(badge);

		const descEl = document.createElement('p');
		descEl.className = 'cad-description';
		descEl.textContent = safeDescription;

		const metaRow = document.createElement('div');
		metaRow.className = 'cad-meta';

		// Metadata chips (category, material, year)
		if (metadata.category) {
			const chip = document.createElement('span');
			chip.className = 'cad-meta-chip';
			chip.textContent = escapeHtml(metadata.category);
			metaRow.appendChild(chip);
		}

		if (metadata.material) {
			const chip = document.createElement('span');
			chip.className = 'cad-meta-chip';
			chip.textContent = escapeHtml(metadata.material);
			metaRow.appendChild(chip);
		}

		if (metadata.year) {
			const chip = document.createElement('span');
			chip.className = 'cad-meta-chip';
			chip.textContent = escapeHtml(String(metadata.year));
			metaRow.appendChild(chip);
		}

		const footerRow = document.createElement('div');
		footerRow.className = 'cad-footer-row';

		const tagContainer = document.createElement('div');
		tagContainer.className = 'cad-tags';

		tags.slice(0, 4).forEach((tag) => {
			const span = document.createElement('span');
			span.className = 'cad-tag';
			span.textContent = escapeHtml(tag);
			tagContainer.appendChild(span);
		});

		const sizeIndicator = document.createElement('span');
		sizeIndicator.className = 'cad-size-indicator';
		if (typeof sizeMB === 'number') {
			sizeIndicator.textContent = `${sizeMB.toFixed(1)} MB`;
		} else {
			sizeIndicator.textContent = '< 10 MB';
		}

		footerRow.appendChild(tagContainer);
		footerRow.appendChild(sizeIndicator);

		card.appendChild(viewerWrapper);
		card.appendChild(header);
		card.appendChild(descEl);
		card.appendChild(metaRow);
		card.appendChild(footerRow);

		return card;
	}

	// Initial load
	loadModels();
};

