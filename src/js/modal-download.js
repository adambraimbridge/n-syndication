'use strict';

import { broadcast } from 'n-ui-foundations';
//import tracking from 'o-tracking';
import { listenTo } from 'o-viewport';
import Superstore from 'superstore';

import {
	ATTR_ACTION,
	ATTR_TRACKABLE,
	CSS_CLASS_PREFIX,
	CSS_SELECTOR_ACTION_DOWNLOAD,
	CSS_SELECTOR_ACTION_SAVE,
	CSS_SELECTOR_REPUBLISHING_BTN,
	CSS_SELECTOR_SYNDATION_ICON,
	DATA_ID_PROPERTY,
	EVENT_PREFIX,
	LABEL_ARIA_OVERLAY,
	MAX_LOCAL_FORMAT_TIME_MS,
	MESSAGES,
	MS_DELAY_HIDE,
	TRACKING,
	URI_PREFIX_DOWNLOAD,
	URI_PREFIX_SAVE
} from './config';

import { toElement } from './util';
import { getItemByHTMLElement } from './data-store';

const localStore = new Superstore('local', 'syndication');

let OVERLAY_FRAGMENT;
let OVERLAY_MODAL_ELEMENT;
let OVERLAY_SHADOW_ELEMENT;
let DOWNLOAD_FORMAT;
let USER_DATA;

function init (flags, user) {
	addEventListener('click', actionModalFromClick, true);

	addEventListener('keyup', actionModalFromKeyboard, true);
	addEventListener('resize', reposition, true);

	listenTo('resize');

	USER_DATA = user;
}

function actionModalFromClick (evt) {
	const item = getItemByHTMLElement(evt.target);

	const trackingEvent = {};
	trackingEvent.category = TRACKING.CATEGORY;
	trackingEvent.contractID = USER_DATA.contract_id;
	trackingEvent.referrer = location.href;
	trackingEvent.action = evt.target.getAttribute(ATTR_TRACKABLE);

	if (item) {
		trackingEvent.message = item.messageCode;
		trackingEvent.article_id = item[DATA_ID_PROPERTY];
		trackingEvent.syndication_content = item.type;
	}

	if (evt.target.matches(CSS_SELECTOR_SYNDATION_ICON)) {
		show(evt);
	}
	else if (evt.target.matches(CSS_SELECTOR_REPUBLISHING_BTN)) {
		evt.preventDefault();

		show(evt);
	}
	else if (evt.target.matches(CSS_SELECTOR_ACTION_SAVE)) {
		save(evt);

		hide();

		show(evt);

		delayHide();
	}
	else if (evt.target.matches(CSS_SELECTOR_ACTION_DOWNLOAD)) {
		download(evt);

		delayHide();
	}
	else {
		if (visible()) {
			const action = evt.target.getAttribute(ATTR_ACTION);

			if (evt.target.matches(`.${CSS_CLASS_PREFIX}-modal-shadow`) || (action && action === 'close')) {
				evt.preventDefault();

				delayHide();
			}
		}
	}

	broadcast('oTracking.event', trackingEvent);
}

function actionModalFromKeyboard (evt) {
	switch (evt.key) {
		case 'Escape' :
			hide();

			const trackingEvent = {};

			trackingEvent.category = TRACKING.CATEGORY;
			trackingEvent.contractID = USER_DATA.contract_id;
			trackingEvent.referrer = location.href;
			trackingEvent.action = 'close-syndication-modal';

			broadcast('oTracking.event', trackingEvent);

			break;
		case ' ' : case 'Enter' :
			if (evt.target.matches(CSS_SELECTOR_SYNDATION_ICON)) {
				show(evt);
			}

			break;
	}

}

function createElement (item) {
	let saveText = item.saved === true ? 'Already saved' : 'Save for later';
	let downloadButtonState = '';
	let downloadHref = generateDownloadURI(item[DATA_ID_PROPERTY]);
	let downloadText = 'Download';
	let saveButtonState = item.saved === true ? 'disabled' : '';
	let saveHref = generateSaveURI(item[DATA_ID_PROPERTY]);
	let message;
	let trackableValue = 'download-item';
	let wordCount = '';

	if (location.pathname.includes('/download')) {
		trackableValue = 'redownload';
	}
	else if (location.pathname.includes('/save')) {
		trackableValue = 'download-saved-item';
	}

	if (item.canBeSyndicated === 'verify') {
		downloadButtonState = 'disabled';
		message = MESSAGES.MSG_2200;
	}
	else if (item.canBeSyndicated === 'withContributorPayment') {
		downloadButtonState = 'disabled';
		message = MESSAGES.MSG_2300;
	}
	else if (item.canBeSyndicated === 'no' || item.canBeSyndicated === null) {
		downloadButtonState = 'disabled';
		saveButtonState = 'disabled';
		saveHref = '#';
		saveText = 'Save unavailable';
		message = MESSAGES.MSG_4000;
	}
	else if (item.downloaded === true) {
		message = MESSAGES.MSG_2100;
	}
	else if (item.canDownload < 1) {
		downloadButtonState = 'disabled';

		switch (item.canDownload) {
			case 0:
				message = MESSAGES.MSG_4200.replace(/\{\{type\}\}/gi, item.type);

				break;
			case -1:
				message = MESSAGES.MSG_4100;

				break;
		}
	}
	else {
		message = MESSAGES.MSG_2000;
	}

//	item.messageCode = message;

	if (downloadButtonState === 'disabled') {
		downloadHref = '#';
		downloadText += ' unavailable';
	}

	if (item.wordCount) {
		wordCount = `<span class="${CSS_CLASS_PREFIX}-modal-word-count">Word count: ${item.wordCount}</span>`;
	}

	let frag = toElement(`<div class="${CSS_CLASS_PREFIX}-modal-shadow"></div>
<div class="${CSS_CLASS_PREFIX}-modal ${CSS_CLASS_PREFIX}-modal-${item.type}" role="dialog" aria-labelledby="${LABEL_ARIA_OVERLAY} ${item.title}" tabindex="0">
	<header class="${CSS_CLASS_PREFIX}-modal-heading">
		<a class="${CSS_CLASS_PREFIX}-modal-close" data-action="close" ${ATTR_TRACKABLE}="close-syndication-modal" role="button" href="#" aria-label="Close" title="Close" tabindex="0"></a>
		<span role="heading" class="${CSS_CLASS_PREFIX}-modal-title">${item.title}</span>
	</header>
	<section class=" ${CSS_CLASS_PREFIX}-modal-content">
		${wordCount}
		${message}
		<div class="${CSS_CLASS_PREFIX}-actions" data-content-id="${item[DATA_ID_PROPERTY]}">
			<a class="${CSS_CLASS_PREFIX}-action" data-action="save" ${saveButtonState} ${ATTR_TRACKABLE}="save-for-later" href="${saveHref}">${saveText}</a>
			<a class="${CSS_CLASS_PREFIX}-action" data-action="download" ${downloadButtonState} ${ATTR_TRACKABLE}="${trackableValue}" href="${downloadHref}">${downloadText}</a>
		</div>
	</section>
</div>`);

	return frag;
}

function delayHide (ms = MS_DELAY_HIDE) {
	let tid = setTimeout(() => {
		clearTimeout(tid);
		tid = null;

		hide();
	}, ms);
}

function download (evt) {
	const item = getItemByHTMLElement(evt.target);

	item.downloaded = true;
	item.messageCode = 'MSG_2100';

	broadcast(`${EVENT_PREFIX}.downloadItem`, {
		item: item
	});
}

function generateDownloadURI (contentID) {
	return `${URI_PREFIX_DOWNLOAD}/${contentID}${DOWNLOAD_FORMAT}`;
}

function generateSaveURI (contentID) {
	return `${URI_PREFIX_SAVE}/${contentID}${DOWNLOAD_FORMAT}`;
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

	item.saved = true;
}

function show (evt) {
	if (visible()) {
		hide();
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

		OVERLAY_MODAL_ELEMENT = OVERLAY_FRAGMENT.lastElementChild;
		OVERLAY_SHADOW_ELEMENT = OVERLAY_FRAGMENT.firstElementChild;

		document.body.append(OVERLAY_FRAGMENT);

		reposition();
	});
}

function visible () {
	return !!(OVERLAY_MODAL_ELEMENT && document.body.contains(OVERLAY_MODAL_ELEMENT));
}

export {
	createElement,
	generateDownloadURI,
	generateSaveURI,
	hide,
	init,
	reposition,
	show,
	save,
	visible
};
