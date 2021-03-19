import request from "supertest";

import app from "./app";

describe("app", () => {
	it("exposes the API endpoint", async () => {
		await request(app).get("/api").expect(200, { message: "Hello, world!" });
	});

	it("serves resources from the static directory", async () => {
		await request(app)
			.get("/")
			.expect("Content-Type", /^text\/html/)
			.expect(200, /For testing purposes only!/);
		await request(app)
			.get("/main.js")
			.expect("Content-Type", /^application\/javascript/)
			.expect(200, /Some JavaScript file/);
	});

	it("handles push-state routing on GET only", async () => {
		await request(app)
			.get("/foobar")
			.expect("Content-Type", /^text\/html/)
			.expect(200, /For testing purposes only!/);
		await request(app).post("/foobar").expect(404);
	});
});
