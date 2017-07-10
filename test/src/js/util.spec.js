'use strict';

const { expect } = require('chai');

const underTest = require('../../../src/js/util');

describe('./src/js/util', function () {
	it('cheapClone should be a Function', function () {
		expect(underTest.cheapClone).to.be.a('function');
	});
});
