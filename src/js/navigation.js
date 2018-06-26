'use strict';

import { $, broadcast } from 'n-ui-foundations';

function init (user) {
	const insertNavItem = insertUserNavItem(user);

	insertNavItem({
		selectorContainer: '#o-header-nav-desktop',
		selectorInsertionPoint: '[data-trackable="Account Settings"]',
		selectorLink: '.o-header__nav-link',
	});

	insertNavItem({
		selectorContainer: '#o-header-drawer',
		selectorInsertionPoint: '[data-trackable="Portfolio"]',
		selectorLink: '.o-header__drawer-menu-link',
	});
}

function insertUserNavItem (user) {
	return ({ selectorContainer, selectorInsertionPoint, selectorLink }) => {
		const elCt = $(selectorContainer);
		if (!elCt) {
			return;
		}

		const navLink = elCt.querySelector(selectorInsertionPoint);
		if (!navLink) {
			return;
		}

		const elInsertionPoint = navLink.parentElement;

		const elNavItem = elInsertionPoint.cloneNode();
		const navLinkCopy = navLink.cloneNode();
		elNavItem.appendChild(navLinkCopy);

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
				contractID: user.contract_id,
				product: 'syndication',
				referrer: location.href,
				url: evt.target.href || evt.target.getAttribute('href')
			});
		});
	};
}

export {
	init
};
