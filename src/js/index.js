import {products as getUserProducts} from 'next-session-client';
import getUserStatus from './get-user-status';
import {init as initRedux} from './redux';

const SYNDICATION_PRODUCT_CODE = 'S1';

function checkIfUserIsSyndicationCustomer () {
	let userIsSyndicationCustomer = false;
	return getUserProducts()
		.then(response => {
			if (response && response.products) {
				userIsSyndicationCustomer = response.products.includes(SYNDICATION_PRODUCT_CODE);
			}
		})
		.catch(err => err)
		.then(() => userIsSyndicationCustomer);
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
