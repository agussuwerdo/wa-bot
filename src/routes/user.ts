import { Router } from "express";
import { GetUserResponse } from "../types";
import { getProfileInfo } from "../middleware/clientConnection";

const router = Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const user = await getProfileInfo(userId);
  if (!user) {
    res.status(500).json({ message: "WhatsApp client not initialized" });
    return;
  }
  const response: GetUserResponse = {
    user: {
      ...user,
    },
  };
  res.json(response);
});

export default router;
