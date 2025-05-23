import { evmAddress } from "@lens-protocol/client";
import { follow, unfollow } from "@lens-protocol/client/actions";

export const followProfile = async (sessionClient: any, address: string) => {
  const result = await follow(sessionClient, { account: evmAddress(address) });
};
