module.exports = {
    "env": {
		"browser": true,
		"node": true,
        "es6": true
    },
	"extends": "eslint:recommended",
	"globals": {
		"google": true
	},
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
		],
		"no-console": [
			"off"
		]
    }
};