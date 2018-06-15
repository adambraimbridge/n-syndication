import {products as getUserProducts} from 'next-session-client';
import getUserStatus from './get-user-status';
import {init as initRedux} from './redux';


async function checkIfUserIsSyndicationCustomer () {
	const SYNDICATION_PRODUCT_CODE = 'S1';
	const response = await getUserProducts().catch(err => err);

	return response && response.products
		? response.products.includes(SYNDICATION_PRODUCT_CODE)
		: false;
}

async function init (flags){
	if (!flags.get('syndication')) {
		return;
	}

	const userIsSyndicationCustomer = await checkIfUserIsSyndicationCustomer();
	if(!userIsSyndicationCustomer){
		return;
	}

	const user = await getUserStatus();
	if (user && user.migrated === true) {
		return initRedux(user);
	}
}

export {
	init,
	checkIfUserIsSyndicationCustomer
};
