'use strict';

import { $, broadcast } from 'n-ui-foundations';
//import tracking from 'o-tracking';

let USER_DATA;

function init (flags, user) {
	insertNavItem('#o-header-nav-desktop', '[data-trackable="My Account"]', '.o-header__nav-link');

	insertNavItem('#o-header-drawer', '[data-trackable="Portfolio"]', '.o-header__drawer-menu-link');

	USER_DATA = user;
}

function insertNavItem (selectorContainer, selectorInsertionPoint, selectorLink) {
	const elCt = $(selectorContainer);

	const elInsertionPoint = elCt.querySelector(selectorInsertionPoint).parentElement;

	const elNavItem = elInsertionPoint.cloneNode(true);

	elNavItem.setAttribute('data-trackable', 'syndication');

	const elNavItemLink = elNavItem.querySelector(selectorLink);

	elNavItemLink.classList.add('n-syndication-republishing');
	elNavItemLink.setAttribute('data-trackable', 'Republishing');
	elNavItemLink.setAttribute('href', '/republishing/contract');
	elNavItemLink.textContent = 'Republishing';

	elInsertionPoint.insertAdjacentElement('afterend', elNavItem);

	elNavItemLink.addEventListener('click', (evt) => {
		broadcast('oTracking.event', {
			category: 'syndication',
			action: 'Republishing',
			contractID: USER_DATA.contract_id,
			referrer: location.href,
			url: evt.target.href || evt.target.getAttribute('href')
		});
	});

	return { container: elCt, item: elNavItem };
}

export {
	init,
	insertNavItem
};
