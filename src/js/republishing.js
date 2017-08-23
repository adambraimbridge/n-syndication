'use strict';

import { init as initDataStore } from './data-store';
import { init as initDownloadModal } from './modal-download';

function init (flags) {
	if (typeof window.republishingInitData !== 'function') {
		window.republishingInitData = function () {};
	}

	initDataStore(flags, window.republishingInitData());

	initDownloadModal(flags);
}

export { init };
