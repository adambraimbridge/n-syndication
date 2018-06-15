'use strict';

import { $$ } from 'n-ui-foundations';

import getUserStatus from './get-user-status';

import { init as initDataStore } from './data-store';
import { init as initIconify } from './iconify';
import { init as initDownloadModal } from './modal-download';
import { init as initNavigation } from './navigation';

import {
	CSS_SELECTOR_VIDEO_DOWNLOAD_BUTTON
} from './config';

function init (flags, user) {
	// this if statement can be removed I think because we check this stuff in index.js
	if (user && user.migrated !== true) {
		return;
	}

	initNavigation(flags, user);

	const allowed = user.allowed || {};

	if ((allowed.spanish_content === true || allowed.spanish_weekend === true) && allowed.ft_com !== true) {
		return;
	}

	initDataStore(flags, user);

	initIconify(flags, user);

	initDownloadModal(flags, user);

	$$(CSS_SELECTOR_VIDEO_DOWNLOAD_BUTTON).forEach(el => el.parentNode.removeChild(el));
}

export { init };
