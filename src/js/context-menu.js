'use strict';

import { throttle } from 'n-ui-foundations';

import { toElement } from './util';

const URI_DOWNLOAD = 'https://www.ft.com/syndication/download';
const URI_SAVE = 'https://www.ft.com/syndication/save';

let ATTR_CONTENT_ID;
let ATTR_CONTENT_TYPE;
let CONTEXT_MENU_ANCHOR_ELEMENT;
let CONTEXT_MENU_ELEMENT;
let CSS_CLASS_PREFIX;
let CSS_SELECTOR_FOR_MOUSEENTER;

function init ({ attrContentID = 'data-content-id', attrContentType = 'data-content-type', cssClassPrefix = 'n-syndication', mouseEnterSelector }) {
	ATTR_CONTENT_ID = attrContentID;
	ATTR_CONTENT_TYPE = attrContentType;
	CSS_CLASS_PREFIX = cssClassPrefix;
	CSS_SELECTOR_FOR_MOUSEENTER = mouseEnterSelector || `.${CSS_CLASS_PREFIX}-icon`;

	addEventListener('mousemove', throttle(actionContextMenu, 100), true);
}

function actionContextMenu (evt) {
	if (evt.target.matches(CSS_SELECTOR_FOR_MOUSEENTER)) {
		CONTEXT_MENU_ANCHOR_ELEMENT = evt.target;

		showAt(evt.target);
	}
	else {
		if (CONTEXT_MENU_ELEMENT && (evt.target === CONTEXT_MENU_ELEMENT || CONTEXT_MENU_ELEMENT.contains(evt.target))) {
			return;
		}

		if (CONTEXT_MENU_ANCHOR_ELEMENT && !evt.target.contains(CONTEXT_MENU_ANCHOR_ELEMENT)) {
			hide();
		}
	}
}

function createElement (options) {

	let frag = toElement(`<div class="${CSS_CLASS_PREFIX}-menu ${CSS_CLASS_PREFIX}-menu-${options.type}"><nav class="${CSS_CLASS_PREFIX}-menu-ct">
		<h1 class="${CSS_CLASS_PREFIX}-menu-title">${options.title}</h1>
		<nav class="${CSS_CLASS_PREFIX}-menu-actions"><ul class="${CSS_CLASS_PREFIX}-menu-actions-ct">
			<li class="${CSS_CLASS_PREFIX}-menu-item"><a class="${CSS_CLASS_PREFIX}-action ${CSS_CLASS_PREFIX}-download" data-action="download" href="${generateDownloadURI(options.id)}">Download</a></li>
			<li class="${CSS_CLASS_PREFIX}-menu-item"><a class="${CSS_CLASS_PREFIX}-action ${CSS_CLASS_PREFIX}-save" data-action="save" href="${generateSaveURI(options.id)}">Save</a></li>
		</ul></nav>	
	</div></div>`);

	return CONTEXT_MENU_ELEMENT = frag.firstElementChild;
}

function generateDownloadURI (contentID) {
	return `${URI_DOWNLOAD}/${contentID}`;
}

function generateSaveURI (contentID) {
	return `${URI_SAVE}/${contentID}`;
}

function hide () {
	CONTEXT_MENU_ELEMENT.remove();

	CONTEXT_MENU_ANCHOR_ELEMENT = null;
	CONTEXT_MENU_ELEMENT = null;
}

function showAt (el) {
	if (visible()) {
		hide();
	}

	createElement({
		id: el.getAttribute(ATTR_CONTENT_ID),
		title: el.nextElementSibling.textContent.trim(),
		type: el.getAttribute(ATTR_CONTENT_TYPE)
	});

	document.body.append(CONTEXT_MENU_ELEMENT);
}

function visible () {
	return !!(CONTEXT_MENU_ELEMENT && CONTEXT_MENU_ELEMENT.parentElement === document.body);
}

export { init };
