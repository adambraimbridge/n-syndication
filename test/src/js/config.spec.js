'use strict';

const { expect } = require('chai');

const underTest = require('../../../src/js/config');

describe('./src/js/config', function () {
	it('config should be an Object', function () {
		expect(typeof underTest).to.equal('object');
	});
});
