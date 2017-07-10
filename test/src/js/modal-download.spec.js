'use strict';

const { expect } = require('chai');

const underTest = require('../../../src/js/modal-download');

describe('./src/js/modal-download', function () {
	it('init should be a Function', function () {
		expect(underTest.init).to.be.a('function');
	});
});
