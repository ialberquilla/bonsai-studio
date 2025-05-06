import { AnyClient, evmAddress } from "@lens-protocol/client";

import { lensClient } from "./client";
import { fetchAvailableAccounts } from "@src/hooks/useLensLogin";
import { fetchAccount, fetchAccountsBulk } from "@lens-protocol/client/actions";

export const getProfileByHandle = async (forHandle: string, client?: AnyClient) => {
  const result = await fetchAccount(client || lensClient, {
    username: {
      localName: forHandle,
    },
  });

  if (result.isErr()) {
    return console.error(result.error);
  }

  return result.value;
};

export const getProfilesOwned = async (ownedBy: string) => {
  try {
    const _profiles = await fetchAvailableAccounts(ownedBy);
    // @ts-ignore
    return _profiles.value.items;
  } catch (error) {
    console.log(error);
  }
};

export const getProfilesByOwners = async (ownedBy: string[], limit = 50) => {
  try {
    const promises: any[] = [];
    for (let i = 0; i < ownedBy.length; i += limit) {
      const _ownedBy = ownedBy.slice(i, i + limit);
      promises.push(fetchAccountsBulk(lensClient, { ownedBy: _ownedBy.map((o) => evmAddress(o)) }));
    }

    const results = await Promise.all(promises);
    return results.map((result) => result.value).flat();
  } catch (error) {
    console.log(error);
    return [];
  }
};
