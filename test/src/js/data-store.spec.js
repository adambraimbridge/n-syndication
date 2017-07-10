'use strict';

const { expect } = require('chai');

const underTest = require('../../../src/js/data-store');

describe('./src/js/data-store', function () {
	it('init should be a Function', function () {
		expect(underTest.init).to.be.a('function');
	});
});
