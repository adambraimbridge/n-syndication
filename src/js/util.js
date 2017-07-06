'use strict';

function toElement (html) {
	const frag = document.createDocumentFragment();

	const ct = document.createElement('div');

	ct.innerHTML = html;

	Array.from(ct.children).reverse().forEach(el => frag.prepend(el));

	return frag;
}

export { toElement };
