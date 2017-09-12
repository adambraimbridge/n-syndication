'use strict';

import { broadcast } from 'n-ui-foundations';
//import tracking from 'o-tracking';

import getUserStatus from './get-user-status';
import { init as initDataStore } from './data-store';
import { init as initDownloadModal } from './modal-download';
import {
	ATTR_TRACKABLE,
	CSS_SELECTOR_REPUBLISHING_HEADER_LINK,
	TRACKING
} from './config';

function init (flags, user) {
	if (user) {
		_init(flags, user);
	}
	else {
		getUserStatus().then(user => {
			_init(flags, user);
		});
	}
}

function _init (flags, user) {
	if (!location.pathname.includes('/contract')) {
		if (typeof window.republishingInitData !== 'function') {
			window.republishingInitData = function () {};
		}

		initDataStore(flags, window.republishingInitData());

		initDownloadModal(flags, user);
	}

	window.getRepublishingUser = () => user;

	track(flags, user);
}

function track (flags, user) {
	const config = JSON.parse(JSON.stringify(TRACKING.DATA));
	config.context.contractID = user.contract_id;
	config.context.appVersion = user.app.version;

//	broadcast('oTracking.page', config);
	broadcast('oTracking.page', {
		app: TRACKING.DATA.context.app,
		appVersion: user.app.version,
		contractID: user.contract_id
	});

	addEventListener('click', (evt) => {
		if (evt.target.matches(CSS_SELECTOR_REPUBLISHING_HEADER_LINK)) {
			broadcast('oTracking.event', {
				category: TRACKING.CATEGORY,
				action: evt.target.getAttribute(ATTR_TRACKABLE),
				app: TRACKING.DATA.context.app,
				appVersion: user.app.version,
				contractID: user.contract_id
			});
		}
	}, true);

//	tracking.init({
//		server: TRACKING.URI
//	});
//
//	tracking.page({
//		app: `${TRACKING.DATA.context.app}.simple`,
//		appVersion: user.app.version,
//		contractID: user.contract_id
//	}, () => {});
//
//	tracking.page(config, () => {});
}

export { init, track };
