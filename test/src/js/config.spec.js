'use strict';

const { expect } = require('chai');

const underTest = require('../../../src/js/config');

const MODULE_ID = './src/js/config';

describe(MODULE_ID, function () {
	it('config should be an object', function () {
		expect(underTest).to.be.an('object');
	});
});
