import { Router } from "express";
import { getClientConnectionStatus } from "../middleware/clientConnection";
import { GetStatusResponse } from "../types";
import { getSocketStatus } from "../websocket/socket";

const router = Router();

router.get("/", async (req, res) => {
  const response: GetStatusResponse = {
    client: await getClientConnectionStatus(),
    socket: getSocketStatus(),
  };
  res.json(response);
});

export default router;
