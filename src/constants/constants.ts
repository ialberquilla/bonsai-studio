import { IS_PRODUCTION } from "@src/services/madfi/utils";

export const MADFI_BANNER_IMAGE_SMALL =
  "https://link.storjshare.io/raw/jvnvg6pove7qyyfbyo5hqggdis6a/misc%2Fmadfi-banner.jpeg";
export const SITE_URL = "https://app.onbons.ai";

export const BONSAI_POST_URL = IS_PRODUCTION ? "https://app.onbons.ai/post" : "https://testnet.onbons.ai/post";
