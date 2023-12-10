import express from "express";
import { createUser,loginUser } from "../controllers/userControllers.js";

const router = express.Router()

router.route('/').post(createUser)
router.route('/auth',loginUser)

export default router;