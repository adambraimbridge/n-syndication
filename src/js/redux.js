'use strict';

import { $$ } from 'n-ui-foundations';

const ATTR_CONTENT_ID = 'data-content-id';
const CSS_CLASS_PREFIX = 'o-syndication';
const SLC_CONTENT_ID = `[${ATTR_CONTENT_ID}]`;

const URI_RESOLVE_SYNDICATABLE_CONTENT = '/syndication/resolve';
const URI_USER_STATUS = '/syndication/user-status';

const EXCLUDE_ELEMENTS = {
	BUTTON: true,
	FORM: true
};

function init (flags) {
	if (!flags.get('syndicationRedux')) {
		return;
	}

	const ELEMENTS = getSyndicatableItems();

	const ITEM_IDS = getSyndicatableItemIDs(ELEMENTS);

	getUserStatus().then(response => {
		if (response !== null) {
			resolveSyndicatableItems(ITEM_IDS)
				.then(data => updatePage(data, ELEMENTS));
		}
	});
}

function getSyndicatableItems () {
	return $$(SLC_CONTENT_ID);
}

function getSyndicatableItemIDs (items) {
	let IDs = Array.from(items).map(item => item.getAttribute(ATTR_CONTENT_ID));

	// Save time by sending only distinct content IDs
	IDs = IDs.reduce((acc, item) => {
		if (item) {
			acc[item] = item;
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

function syndicate (item, elements) {
	if (!elements.length) {
		return;
	}

	elements.forEach(el => {
		el.classList.add(CSS_CLASS_PREFIX);
		el.classList.add(`${CSS_CLASS_PREFIX}-state-${item.canBeSyndicated}`);
	});
}

function updatePage (data, elements) {
	const elementsByContentID = Array.from(elements).reduce((acc, item) => {
		const contentID = item.getAttribute(ATTR_CONTENT_ID);

		if (!Array.isArray(acc[contentID])) {
			acc[contentID] = [];
		}

		if (item !== document.documentElement && !EXCLUDE_ELEMENTS[item.tagName.toUpperCase()]) {
			acc[contentID].push(item);
		}

		return acc;
	}, {});

	data.forEach(item => syndicate(item, elementsByContentID[item.id]));
}

export { init };
