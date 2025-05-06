export const toHexString = (id: number) => {
  const profileHexValue = id.toString(16);
  return `0x${profileHexValue.length === 3 ? profileHexValue.padStart(4, "0") : profileHexValue.padStart(2, "0")}`;
};

export const getProfileImage = (profile) => {
  const picture = profile?.metadata?.picture;
  if (picture && typeof picture === "string" && picture.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${picture.slice(7)}`;
  }
  return picture || "/default.png";
};
