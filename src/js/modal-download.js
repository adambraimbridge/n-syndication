'use strict';

import { broadcast } from 'n-ui-foundations';

import {
	CSS_CLASS_PREFIX,
	CSS_CLASS_PREFIX_BUTTON,
	CSS_CLASS_PREFIX_OVERLAY,
	CSS_SELECTOR_SYNDATION_ICON,
	DATA_ID_PROPERTY,
	LABEL_ARIA_OVERLAY,
	OVERLAY_TEXT_DISCLAIMER,
	URI_PREFIX_DOWNLOAD,
	URI_PREFIX_SAVE
} from './config';

import { toElement } from './util';
import { getItemByHTMLElement } from './data-store';

let OVERLAY_FRAGMENT;
let OVERLAY_MODAL_ELEMENT;
let OVERLAY_SHADOW_ELEMENT;

function init () {
	addEventListener('click', actionContextMenuFromClick, true);

	addEventListener('keyup', actionContextMenuFromKeyboard, true);
}

function actionContextMenuFromClick (evt) {
	if (evt.target.matches(CSS_SELECTOR_SYNDATION_ICON)) {
		show(evt);
	}
	else {
		if (visible()) {
			if (evt.target.matches(`${CSS_CLASS_PREFIX_OVERLAY}-shadow`) || evt.target.matches(`${CSS_CLASS_PREFIX_OVERLAY}__close`)) {
				hide();
			}
		}
	}
}

function actionContextMenuFromKeyboard (evt) {
	switch (evt.key) {
		case 'Escape' :
			hide();

			break;
		case ' ' : case 'Enter' :
			if (evt.target.matches(CSS_SELECTOR_SYNDATION_ICON)) {
				show(evt);
			}

			break;
	}
}

function createElement (item) {

	let frag = toElement(`<div class="${CSS_CLASS_PREFIX_OVERLAY}-shadow ${CSS_CLASS_PREFIX}-menu-shadow"></div>
<div class="${CSS_CLASS_PREFIX_OVERLAY} ${CSS_CLASS_PREFIX_OVERLAY}--overlay ${CSS_CLASS_PREFIX_OVERLAY}--modal ${CSS_CLASS_PREFIX}-menu ${CSS_CLASS_PREFIX}-menu-${item.type}" role="dialog" aria-labelledby="${LABEL_ARIA_OVERLAY} ${item.title}" tabindex="0">
	<header class="${CSS_CLASS_PREFIX_OVERLAY}__heading">
		<a class="${CSS_CLASS_PREFIX_OVERLAY}__close" role="button" href="#void" aria-label="Close" title="Close" tabindex="0"></a>
		<span role="heading" class="${CSS_CLASS_PREFIX_OVERLAY}__title">${item.title}</span>
	</header>
	<section class="${CSS_CLASS_PREFIX_OVERLAY}__content">
		<p>${OVERLAY_TEXT_DISCLAIMER}</p>
		<a class="${CSS_CLASS_PREFIX}-button ${CSS_CLASS_PREFIX_BUTTON}"  data-action="save" href="${generateSaveURI(item[DATA_ID_PROPERTY])}">Save</a>
		<a class="${CSS_CLASS_PREFIX}-button ${CSS_CLASS_PREFIX_BUTTON} ${CSS_CLASS_PREFIX_BUTTON}--standout" data-action="download" href="${generateDownloadURI(item[DATA_ID_PROPERTY])}">Download</a>
	</section>
</div>`);

	return frag;
}

function generateDownloadURI (contentID) {
	return `${URI_PREFIX_DOWNLOAD}/${contentID}`;
}

function generateSaveURI (contentID) {
	return `${URI_PREFIX_SAVE}/${contentID}`;
}

function hide () {
	if (visible()) {
		OVERLAY_MODAL_ELEMENT.remove();

		OVERLAY_SHADOW_ELEMENT.remove();

		OVERLAY_FRAGMENT =
		OVERLAY_MODAL_ELEMENT =
		OVERLAY_SHADOW_ELEMENT = null;
	}
}

function show (evt) {
	if (visible()) {
		hide();
	}

	OVERLAY_FRAGMENT = createElement(getItemByHTMLElement(evt.target));

	OVERLAY_MODAL_ELEMENT = OVERLAY_FRAGMENT.lastElementChild;
	OVERLAY_SHADOW_ELEMENT = OVERLAY_FRAGMENT.firstElementChild;

	document.body.append(OVERLAY_FRAGMENT);

	const DOC_EL = document.documentElement;

//	let x = scrollX + (DOC_EL.clientWidth / 2);
//	let y = scrollY + (DOC_EL.clientHeight / 2);
	let x = (DOC_EL.clientWidth / 2) - (OVERLAY_MODAL_ELEMENT.clientWidth / 2);
	let y = (DOC_EL.clientHeight / 3) - (OVERLAY_MODAL_ELEMENT.clientHeight / 2);

	OVERLAY_MODAL_ELEMENT.style.left = `${x}px`;
	OVERLAY_MODAL_ELEMENT.style.top = `${y}px`;
}

function visible () {
	return !!(OVERLAY_MODAL_ELEMENT && document.body.contains(OVERLAY_MODAL_ELEMENT));
}

export { init };
