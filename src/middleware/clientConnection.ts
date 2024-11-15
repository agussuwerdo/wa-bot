import { Request, Response } from "express";
import { WhatsAppClient } from "../services/whatsappClient";
import { ClientStatus, UserResponse } from "../types";

export const checkClientLoggedIn = (
  req: Request,
  res: Response,
  next: Function
): void => {
  if (!WhatsAppClient.getIsLoggedIn()) {
    res.status(401).json({ message: "Client is not logged in" });
    return;
  }
  next();
};

export const getClientConnectionStatus = async (): Promise<ClientStatus> => {
  const client = WhatsAppClient.getClient();
  let response: ClientStatus = {
    status: "offline",
    isConnected: false,
    info: null,
    profilePicUrl: null,
  };

  if (client && client.info) {
    const connected = WhatsAppClient.getIsConnected();
    response.status = "online";
    response.isConnected = connected;
    response.info = client.info;

    let profilePicUrl = "";
    if (connected) {
      profilePicUrl = await client.getProfilePicUrl(
        client.info.wid._serialized
      );
    }
    response.profilePicUrl = profilePicUrl;
  }
  return response;
};

export const getProfileInfo = async (
  id: string
): Promise<UserResponse | false> => {
  const client = WhatsAppClient.getClient();
  if (!client) {
    return false;
  }
  let profilePicUrl = "";
  if (WhatsAppClient.getIsConnected()) {
    profilePicUrl = await client.getProfilePicUrl(id);
  }
  return { ...client.info, profilePicUrl };
};
