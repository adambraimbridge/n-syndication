'use strict';

import {broadcast} from 'n-ui-foundations';
//import tracking from 'o-tracking';
import {listenTo} from 'o-viewport';
import Superstore from 'superstore';

import {MESSAGES, TRACKING} from './config';

import {toElement} from './util';
import {getAllItemsForID, getItemByHTMLElement} from './data-store';


const MAX_LOCAL_FORMAT_TIME_MS = 300000;
const localStore = new Superstore('local', 'syndication');

let OVERLAY_FRAGMENT;
let OVERLAY_MODAL_ELEMENT;
let OVERLAY_SHADOW_ELEMENT;
let DOWNLOAD_FORMAT;
let USER_DATA;

function init (user) {
	addEventListener('click', actionModalFromClick, true);

	addEventListener('keyup', actionModalFromKeyboard, true);
	addEventListener('resize', reposition, true);

	listenTo('resize');

	USER_DATA = user;
}

function actionModalFromClick (evt) {
	const item = getItemByHTMLElement(evt.target);

	let fire = true;

	const trackingEvent = {};

	trackingEvent.category = TRACKING.CATEGORY;
	trackingEvent.contractID = USER_DATA.contract_id;
	trackingEvent.product = TRACKING.CATEGORY;
	trackingEvent.url = location.href;
	trackingEvent.action = evt.target.getAttribute('data-trackable');

	if (item) {
		trackingEvent.lang = item.lang;
		trackingEvent.message = item.messageCode;
		trackingEvent.article_id = item['id'];
		trackingEvent.syndication_content = item.type;
	}

	if (evt.target.matches('[data-content-id][data-syndicated="true"].n-syndication-icon')) {
		show(evt);
	}
	else if (evt.target.matches('[data-content-id][data-syndicated="true"].download-button')) {
		evt.preventDefault();

		show(evt);
	}
	else if (evt.target.matches('.n-syndication-action[data-action="save"]')) {
		save(evt);

		hide();

		show(evt);

		delayHide();
	}
	else if (evt.target.matches('.n-syndication-action[data-action="download"]')) {
		download(evt);

		delayHide();
	}
	else {
		if (visible()) {
			const action = evt.target.getAttribute('data-action');

			if (evt.target.matches('.n-syndication-modal-shadow') || (action && action === 'close')) {
				evt.preventDefault();

				delayHide();
			}
		}
		else {
			fire = false;
		}
	}

	!fire || broadcast('oTracking.event', trackingEvent);
}

function actionModalFromKeyboard (evt) {
	switch (evt.key) {
		case 'Escape' :
			hide();

			const trackingEvent = {};

			trackingEvent.category = TRACKING.CATEGORY;
			trackingEvent.contractID = USER_DATA.contract_id;
			trackingEvent.product = TRACKING.CATEGORY;
			trackingEvent.url = location.href;
			trackingEvent.action = 'close-syndication-modal';

			broadcast('oTracking.event', trackingEvent);

			break;
		case ' ' : case 'Enter' :
			if (evt.target.matches('[data-content-id][data-syndicated="true"].n-syndication-icon')) {
				show(evt);
			}

			break;
	}

}

function createElement (item) {
	let saveText = item.saved === true ? 'Already saved' : 'Save for later';
	let downloadButtonState = '';
	let downloadHref = generateDownloadURI(item['id'], item);
	let downloadText = 'Download';
	let saveButtonState = item.saved === true ? 'disabled' : '';
	let saveHref = generateSaveURI(item['id'], item);
	let message;
	let trackableValueDownloadItem = 'download-items';
	let trackableValueSaveForLater = 'save-for-later';
	let wordCount = '';
	let trackableAttributeForDownload = `${'data-trackable'}`;

	if (item.embargoPeriod) {
		if (typeof item.embargoPeriod === 'number') {
			item.embargoPeriod = `${item.embargoPeriod} day${item.embargoPeriod > 1 ? 's' : ''}`;
		}

		item.embargoMessage = item.embargoPeriod ? interpolate(MESSAGES.EMBARGO, item) : '';
	}

	const hasTranslationComponent = document.getElementById('ftlabsTranslationContainer');
	item.translationMessage = Boolean(hasTranslationComponent) ? interpolate(MESSAGES.ENGLISH, item) : '';

	if (location.pathname.includes('/download')) {
		trackableValueDownloadItem = 'redownload';
		trackableValueSaveForLater += '-downloads-page';
	}
	else if (location.pathname.includes('/save')) {
		// trackableValueDownloadItem = 'download-saved-item';
		trackableValueDownloadItem = '';
	}

	if (USER_DATA.MAINTENANCE_MODE === true) {
		message = MESSAGES.MSG_5100;
		downloadButtonState = 'disabled';
		saveButtonState = 'disabled';
		item.title = '';
	}
	else if (item.type === 'package') {
		message = MESSAGES.MSG_4300;
		downloadButtonState = 'disabled';
		saveButtonState = 'disabled';
	}
	else if (item.notAvailable === true) {
		downloadButtonState = 'disabled';
		message = MESSAGES.MSG_4050;
	}
	else if (item.canBeSyndicated === 'verify') {
		downloadButtonState = 'disabled';
		message = item.lang !== 'en' ? MESSAGES.MSG_4250 : MESSAGES.MSG_2200;
	}
	else if (item.canBeSyndicated === 'withContributorPayment') {
		if (USER_DATA.contributor_content !== true) {
			downloadButtonState = 'disabled';
			message = MESSAGES.MSG_2300;
		}
		else if (item.downloaded === true) {
			message = MESSAGES.MSG_2340;
		}
		else {
			message = MESSAGES.MSG_2320;
		}
	}
	else if (item.canBeSyndicated === 'no' || !item.canBeSyndicated) {
		downloadButtonState = 'disabled';
		saveButtonState = 'disabled';
		message = MESSAGES.MSG_4000;
	}
	else if (item.downloaded === true) {
		message = MESSAGES.MSG_2100;
	}
	else if (item.canDownload < 1) {
		downloadButtonState = 'disabled';

		switch (item.canDownload) {
			case 0:
				message = item.lang !== 'en' ? MESSAGES.MSG_4250 : MESSAGES.MSG_4200;

				break;
			case -1:
				message = MESSAGES.MSG_4100;

				break;
		}
	}
	else {
		message = MESSAGES.MSG_2000;
	}

	message = interpolate(message, item);
	//	item.messageCode = message;

	if (downloadButtonState === 'disabled') {
		downloadHref = '#';
		downloadText += ' unavailable';
	}
	if (saveButtonState === 'disabled') {
		saveHref = '#';

		if (item.saved !== true) {
			saveText = 'Save unavailable';
		}
	}

	if (item.wordCount) {
		wordCount = `<span class="n-syndication-modal-word-count">Word count: ${item.wordCount}</span>`;
	}

	if (trackableValueDownloadItem) {
		trackableAttributeForDownload = `${trackableAttributeForDownload}="${trackableValueDownloadItem}"`;
	}
	else {
		trackableAttributeForDownload = '';
	}

	return toElement(`<div class="n-syndication-modal-shadow"></div>
<div class="n-syndication-modal n-syndication-modal-${item.type}" role="dialog" aria-labelledby="'Download:  ${item.title}" tabindex="0">
	<header class="n-syndication-modal-heading">
		<a class="n-syndication-modal-close" data-action="close" 'data-trackable="close-syndication-modal" role="button" href="#" aria-label="Close" title="Close" tabindex="0"></a>
		<span role="heading" class="n-syndication-modal-title">${item.title}</span>
	</header>
	<section class=" n-syndication-modal-content">
		${wordCount}
		<div class="n-syndication-modal-message">
		${message}
		</div>
		<div class="n-syndication-actions" data-content-id="${item['id']}" data-iso-lang="${item['lang']}">
			<a class="n-syndication-action" data-action="save" ${saveButtonState} data-trackable="${trackableValueSaveForLater}" href="${saveHref}">${saveText}</a>
			<a class="n-syndication-action n-syndication-action-primary" data-action="download" ${downloadButtonState} ${trackableAttributeForDownload} href="${downloadHref}">${downloadText}</a>
		</div>
	</section>
</div>`);
}

function delayHide (ms = 500) {
	let tid = setTimeout(() => {
		clearTimeout(tid);
		tid = null;

		hide();
	}, ms);
}

function download (evt) {
	const item = getItemByHTMLElement(evt.target);
	const items = getAllItemsForID(item.id);

	items.forEach(item => {
		item.downloaded = true;
		item.messageCode = 'MSG_2100';
	});

	broadcast(`nSyndication.downloadItem`, {
		item: item
	});
}

function generateDownloadURI (contentID, item) {
	let uri = `${location.port ? '' : 'https://dl.syndication.ft.com'}/syndication/download/${contentID}${DOWNLOAD_FORMAT}`;

	if (item.lang) {
		uri += (uri.includes('?') ? '&' : '?') + `lang=${item.lang}`;
	}

	return uri;
}

function generateSaveURI (contentID, item) {
	let uri = `/syndication/save/${contentID}${DOWNLOAD_FORMAT}`;

	if (item.lang) {
		uri += (uri.includes('?') ? '&' : '?') + `lang=${item.lang}`;
	}

	return uri;
}

function hide () {
	if (visible()) {
		OVERLAY_MODAL_ELEMENT.remove();

		OVERLAY_SHADOW_ELEMENT.remove();

		OVERLAY_FRAGMENT = null;
		OVERLAY_MODAL_ELEMENT = null;
		OVERLAY_SHADOW_ELEMENT = null;
	}
}

function interpolate (str, o) {
	return String(str).replace(/\{\{([^\}]+)\}\}/gim, (m, p) => p in o ? o[p] : '');
}

function reposition () {
	if (!visible()) {
		return;
	}

	const DOC_EL = document.documentElement;

	let x = (DOC_EL.clientWidth / 2) - (OVERLAY_MODAL_ELEMENT.clientWidth / 2);
	let y = Math.max((DOC_EL.clientHeight / 3) - (OVERLAY_MODAL_ELEMENT.clientHeight / 2), 100);

	OVERLAY_MODAL_ELEMENT.style.left = `${x}px`;
	OVERLAY_MODAL_ELEMENT.style.top = `${y}px`;
}

function save (evt) {
	const item = getItemByHTMLElement(evt.target);
	const items = getAllItemsForID(item.id);

	items.forEach(item => item.saved = true);
}
function shouldPreventDefault (el) {
	do {
		if (el.tagName.toUpperCase() === 'A') {
			return true;
		}
	} while (el = el.parentElement);

	return false;
}

function show (evt) {
	if (visible()) {
		hide();
	}

	if (shouldPreventDefault(evt.target.parentElement)) {
		evt.preventDefault();
	}

	localStore.get('download_format').then(val => {
		if (val) {
			if (Date.now() - val.time <= MAX_LOCAL_FORMAT_TIME_MS) {
				DOWNLOAD_FORMAT = `?format=${val.format}`;
			}
			else {
				DOWNLOAD_FORMAT = '';
			}
		}
		else {
			DOWNLOAD_FORMAT = '';
		}

		OVERLAY_FRAGMENT = createElement(getItemByHTMLElement(evt.target));

		OVERLAY_MODAL_ELEMENT = OVERLAY_FRAGMENT.lastElementChild || OVERLAY_FRAGMENT.lastChild;
		OVERLAY_SHADOW_ELEMENT = OVERLAY_FRAGMENT.firstElementChild || OVERLAY_FRAGMENT.firstChild;

		document.body.appendChild(OVERLAY_FRAGMENT);

		reposition();
	});
}

function visible () {
	return !!(OVERLAY_MODAL_ELEMENT && document.body.contains(OVERLAY_MODAL_ELEMENT));
}

export {
	init
};
