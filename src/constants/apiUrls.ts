import { IS_PRODUCTION } from "@src/services/madfi/utils";

const PRODUCTION_URLS = {
  openSea: "https://opensea.io",
  lensAPI: "https://api.lens.xyz/graphql",
  storjGateway: "https://www.storj-ipfs.com",
};

const STAGING_URLS = {
  openSea: "https://testnets.opensea.io",
  ethExplorer: "https://mumbai.polygonscan.com",
  lensAPI: "https://api.testnet.lens.dev/graphql",
  storjGateway: "https://www.storj-ipfs.com",
};

export const apiUrls = IS_PRODUCTION ? PRODUCTION_URLS : STAGING_URLS;
