import { lens } from "@src/services/madfi/utils";
import {
  mainnet,
  polygon,
  base,
  baseSepolia,
  zkSync,
  zkSyncSepoliaTestnet,
  lensTestnet,
} from "viem/chains";

export const ChainRpcs = {
  [polygon.id]: process.env.NEXT_PUBLIC_POLYGON_RPC!,
  [base.id]: process.env.NEXT_PUBLIC_BASE_RPC!,
  [baseSepolia.id]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC!,
  [zkSync.id]: process.env.NEXT_PUBLIC_ZKSYNC_RPC!,
  [zkSyncSepoliaTestnet.id]: process.env.NEXT_PUBLIC_ZKSYNC_SEPOLIA_RPC!,
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC!,
  [lens.id]: process.env.NEXT_PUBLIC_LENS_RPC || "https://rpc.lens.xyz",
  [lensTestnet.id]: "https://rpc.testnet.lens.xyz",
};