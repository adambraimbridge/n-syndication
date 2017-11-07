import { init, checkIfUserIsSyndicationCustomer } from './src/js/index';
import * as CONFIG from './src/js/config';
import { init as initRepublishing } from './src/js/republishing';
import { getUserData } from './src/js/data-store';

export {
	CONFIG,
	init,
	initRepublishing,
	checkIfUserIsSyndicationCustomer,
	getUserData
};
