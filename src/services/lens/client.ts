import { PublicClient, mainnet, testnet } from "@lens-protocol/client";
import { StorageClient } from "@lens-chain/storage-client";
import { IS_PRODUCTION } from "../madfi/utils";
import { SITE_URL } from "@src/constants/constants";
export const LENS_ENVIRONMENT = IS_PRODUCTION ? mainnet : testnet;

// TODO: something cleaner
let storage;
if (typeof window !== 'undefined') {
  storage = window.localStorage;
}
export const lensClient = PublicClient.create({
  environment: LENS_ENVIRONMENT,
  origin: SITE_URL,
  storage,
});

export const storageClient = StorageClient.create();
