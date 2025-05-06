export const _hash = (uriOrHash: string) =>
  typeof uriOrHash === "string" && uriOrHash.startsWith("ipfs://") ? uriOrHash.split("ipfs://")[1] : uriOrHash;

export const ipfsOrNot = (urlOrUri?: string) =>
  urlOrUri?.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${_hash(urlOrUri)}` : urlOrUri || "";
