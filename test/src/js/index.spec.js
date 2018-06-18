'use strict';

const { expect } = require('chai');

const underTest = require('../../../src/js/index');

describe('./src/js/redux', function () {
	it('init should be a Function', function () {
		expect(underTest.init).to.be.a('function');
	});
});
