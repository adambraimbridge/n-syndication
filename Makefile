node_modules/@financial-times/n-gage/index.mk:
	npm install --no-package-lock --no-save @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

test: verify
