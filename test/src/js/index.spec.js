'use strict';

const { expect } = require('chai');

const underTest = require('../../../src/js/index');

describe('#init', function () {
	it('init should be a Function', function () {
		expect(underTest.init).to.be.a('function');
	});

	it.skip('should return undefined if the syndication flag is off and not call stubs', () => { });

	context('when syndication customer', () => {
		it.skip('should return undefined if the user isn’t migrated', () => { });
		it.skip('should initialise the republising navigation', () => { });
		it.skip('should end if the user isn’t allowed ft.com republishing', () => { });
		it.skip('should initialise the rest if allowed ft.com republishing', () => { });
	});

	context('when not syndication customer', () => {
		it.skip('should not attempt to get user status or initialise syndication', () => { });
	});
});

describe('#checkIfUserIsSyndicationCustomer', () => {
	it.skip('should return true if user has the S1 product code in their products', () => { });
	it.skip('should return false if user doesn’t have the S1 product code in their products', () => { });
	it.skip('should return false if there was an error fetching the products', () => { });
});
