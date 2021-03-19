module.exports = {
	projects: [
		{
			displayName: "client",
			setupFilesAfterEnv: [
				"<rootDir>/client/setupTests.js",
			],
			testEnvironment: "jsdom",
			testMatch: [
				"<rootDir>/client/**/*.test.js",
			],
		},
		{
			displayName: "server",
			testEnvironment: "node",
			testMatch: [
				"<rootDir>/server/**/*.test.js",
			],
		},
	],
	testRunner: "jest-circus/runner",
};
