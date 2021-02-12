module.exports = {
	root: true,
	extends: ['@hokify'],
	parserOptions: {
		project: ['./ts-cache/tsconfig.json', './storages/*/tsconfig.json']
	}
};
