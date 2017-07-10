'use strict';

const { expect } = require('chai');

const underTest = require('../../../src/js/get-user-status');

describe('./src/js/get-user-status', function () {
	it('getUserStatus should be a Function', function () {
		expect(underTest).to.be.an('function');
	});
});
