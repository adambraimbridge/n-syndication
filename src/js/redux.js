'use strict';

import { $$ } from 'n-ui-foundations';

import { init as initDataStore } from './data-store';
import { init as initIconify } from './iconify';
import { init as initDownloadModal } from './modal-download';
import { init as initNavigation } from './navigation';

import {
	CSS_SELECTOR_VIDEO_DOWNLOAD_BUTTON
} from './config';

// TODO: move this init logic into index.js
function init (user) {

	initNavigation(user);

	const allowed = user.allowed || {};

	const allowedSomeSpanishContent = (allowed.spanish_content === true || allowed.spanish_weekend === true)
	if (allowedSomeSpanishContent && allowed.ft_com !== true) {
		return;
	}

	initDataStore(user);

	initIconify();

	initDownloadModal(user);

	$$(CSS_SELECTOR_VIDEO_DOWNLOAD_BUTTON).forEach(el => el.parentNode.removeChild(el));
}

export { init };
