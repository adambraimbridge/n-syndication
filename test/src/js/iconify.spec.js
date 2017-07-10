'use strict';

const { expect } = require('chai');

const underTest = require('../../../src/js/iconify');

describe('./src/js/iconify', function () {
	it('init should be a Function', function () {
		expect(underTest.init).to.be.a('function');
	});
});
