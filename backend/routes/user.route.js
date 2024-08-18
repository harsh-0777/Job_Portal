import express from "express";
import {
  loginUser,
  logoutUser,
  refrehIncomingToken,
  registerUser,
} from "../controllers/user.controller.js";

import { veriftToken } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", veriftToken, logoutUser);
router.get("/refreshToken", refrehIncomingToken);

export default router;
