'use strict';

import { $$ } from 'n-ui-foundations';

import { toElement } from './util';
import { init as initContextMenu } from './context-menu';

const ATTR_CONTENT_ID = 'data-content-id';
const ATTR_CONTENT_TYPE = 'data-content-type';
const ATTR_SYNDICATED = 'data-syndicated';
const CSS_CLASS_PREFIX = 'n-syndication';
const CSS_SELECTOR_CONTENT_ID = `[${ATTR_CONTENT_ID}]`;
const CSS_SELECTOR_NOT_SYNDICATED = `:not([${ATTR_SYNDICATED}="true"])`;

const DATA_STORE = [];
const DATA_STORE_MAP = {};

const EXCLUDE_ELEMENTS = {
	BUTTON: true,
	FORM: true
};

const SYNDICATION_INSERTION_RULES = {
	'a': { fn: 'closest', slc: '.o-teaser__heading' },
	'article': { fn: 'querySelector', slc: '.topper__headline' }
};

const URI_RESOLVE_SYNDICATABLE_CONTENT = '/syndication/resolve';
const URI_USER_STATUS = '/syndication/user-status';

function init (flags) {
	if (!flags.get('syndicationRedux')) {
		return;
	}

	getUserStatus().then(response => {
		if (response !== null) {
			addEventListener('asyncContentLoaded', () => syndicate(), true);

			initContextMenu({
				attrContentID: ATTR_CONTENT_ID,
				attrContentType: ATTR_CONTENT_TYPE,
				cssClassPrefix: CSS_CLASS_PREFIX,
				mouseEnterSelector: `.${CSS_CLASS_PREFIX}-icon`
			});

			return syndicate();
		}
	});
}

function findElementToSyndicate (el) {
	if (el !== document.documentElement && !EXCLUDE_ELEMENTS[el.tagName.toUpperCase()]) {
		for (let [match, rule] of Object.entries(SYNDICATION_INSERTION_RULES)) {
			if (el.matches(match)) {
				const targetElement = el[rule.fn](rule.slc);

				if (targetElement) {
					return targetElement;
				}
			}
		}
	}

	return null;
}

function getSyndicatableItems () {
	return $$(`${CSS_SELECTOR_CONTENT_ID}${CSS_SELECTOR_NOT_SYNDICATED}`);
}

function getSyndicatableItemIDs (items) {
	let IDs = Array.from(items).map(el => {
		let ID = el.getAttribute(ATTR_CONTENT_ID);

		// there is a case where an item has a `data-content-id` with no value.
		// I can't figure it out right now, so temporary "fix"...
		if (!ID && el.tagName.toUpperCase() === 'A') {
			ID = el.getAttribute('href').split('/').pop();

			el.setAttribute(ATTR_CONTENT_ID, ID);
		}

		return ID;
	});

	// Save time by sending only distinct content IDs
	IDs = IDs.reduce((acc, id) => {
		if (id) {
			acc[id] = id;
		}

		return acc;
	}, {});

	return Object.keys(IDs);
}

function getUserStatus () {
	return fetch(URI_USER_STATUS, { credentials: 'include' })
		.then(response => {
			if (response.ok) {
				return response.json();
			}
			else {
				// this is a valid response, i.e. the user is not a syndication user but somehow managed to get here.
				// e.g. a developer with the right flags turned on, but doesn't belong to a licence.
				if (response.status === 401) {
					return null;
				}

				return response.text()
					.then(text => {
						throw new Error(`Next /syndication/user-status responded with "${text}" (${response.status})`);
					});
			}
		})
		.catch(error => {
			document.body.dispatchEvent(new CustomEvent('oErrors.log', {
				bubbles: true,
				detail: {
					error: error,
					info: {
						component: 'next-syndication-redux'
					}
				}
		}));
	});
}

function icon (item) {
	return toElement(`<span class="${CSS_CLASS_PREFIX}-icon ${CSS_CLASS_PREFIX}-icon-state-${item.canBeSyndicated}" ${ATTR_CONTENT_ID}="${item.id}" ${ATTR_CONTENT_TYPE}="${item.type}" role="button"></span>`);
}

function refreshDataStore (data) {
	const EXISTING = [];

	data.forEach(item => {
		if (item.id in DATA_STORE_MAP) {
			EXISTING.push(item);

			const existingIndex = DATA_STORE.findIndex(storeItem => storeItem.id === item.id);

			if (existingIndex > -1) {
				DATA_STORE[existingIndex] = item;
			}
		}

		if (!EXISTING.includes(item)) {
			DATA_STORE.push(item);
		}

		// replace with new content things may have changed
		DATA_STORE_MAP[item.id] = item;
	});

	return {
		DATA_STORE,
		DATA_STORE_MAP,
		EXISTING
	};
}

function resolveSyndicatableItems (itemIDs) {
	return fetch(URI_RESOLVE_SYNDICATABLE_CONTENT, {
		body: JSON.stringify(itemIDs),
		credentials: 'include',
		headers: {
			'content-type': 'application/json'
		},
		method: 'POST'
	}).then(response => {
		if (response.ok) {
			return response.json();
		}
		else {
			return response.text()
				.then(text => {
					throw new Error(`Next /syndication/resolve responded with "${text}" (${response.status})`);
				});
		}

	}).catch(error => {
		document.body.dispatchEvent(new CustomEvent('oErrors.log', {
			bubbles: true,
			detail: {
				error: error,
				info: {
					component: 'next-syndication-redux'
				}
			}
		}));
	});
}

function syndicate () {
	const ELEMENTS = getSyndicatableItems();

	const ITEM_IDS = getSyndicatableItemIDs(ELEMENTS);

	return resolveSyndicatableItems(ITEM_IDS)
		.then(data => {
			refreshDataStore(data);

			updatePage(ELEMENTS);
		});
}

function syndicateElement (item, el) {
	const element = findElementToSyndicate(el);

	el.setAttribute(ATTR_CONTENT_TYPE, item.type);
	el.setAttribute(ATTR_SYNDICATED, 'true');

	if (element !== null && element.getAttribute(ATTR_SYNDICATED) !== 'true') {
		element.classList.add(CSS_CLASS_PREFIX);
		element.classList.add(`${CSS_CLASS_PREFIX}-state-${item.canBeSyndicated}`);

		element.prepend(icon(item));

		element.setAttribute(ATTR_CONTENT_TYPE, item.type);
	}
}

function syndicateElements (item, els) {
	if (!els.length) {
		return;
	}

	els.forEach(el => syndicateElement(item, el));
}

function updatePage (els) {
	const elementsByContentID = Array.from(els).reduce((acc, el) => {
		const contentID = el.getAttribute(ATTR_CONTENT_ID);

		if (!Array.isArray(acc[contentID])) {
			acc[contentID] = [];
		}

		acc[contentID].push(el);

		return acc;
	}, {});

	DATA_STORE.forEach(item => syndicateElements(item, elementsByContentID[item.id]));
}

export { init };
