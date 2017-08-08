'use strict';

import { $ } from 'n-ui-foundations';

function init () {
	insertNavItem('#o-header-nav-desktop', '[data-trackable="My Account" i]', '.o-header__nav-link');

	insertNavItem('#o-header-drawer', '[data-trackable="Portfolio" i]', '.o-header__drawer-menu-link');
}

function insertNavItem (selectorContainer, selectorInsertionPoint, selectorLink) {
	const elCt = $(selectorContainer);

	const elInsertionPoint = elCt.querySelector(selectorInsertionPoint).parentElement;

	const elNavItem = elInsertionPoint.cloneNode(true);

	const elNavItemLink = elNavItem.querySelector(selectorLink);

	elNavItemLink.classList.add('n-syndication-republishing');
	elNavItemLink.setAttribute('data-trackable', 'Republishing');
	elNavItemLink.setAttribute('href', '/republishing/contract');
	elNavItemLink.textContent = 'Republishing';

	elInsertionPoint.insertAdjacentElement('afterend', elNavItem);

	return { container: elCt, item: elNavItem };
}

export {
	init,
	insertNavItem
};
