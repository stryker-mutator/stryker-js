import { Router } from "express";

const router = new Router();

router.get("/", (_, res) => {
	res.json({ message: "Hello, world!" });
});

export default router;
