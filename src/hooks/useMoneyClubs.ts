import { useQuery } from "@tanstack/react-query";
import { getAddress, zeroAddress } from "viem";
import {
  getRegisteredClub,
  getRegisteredClubById,
  getSellPrice,
  getRegistrationFee,
  getRewardPool,
  getBuyPrice,
  getClubHoldings,
  getBuyAmount,
} from "@src/services/madfi/moneyClubs";
import { PROTOCOL_DEPLOYMENT } from "@src/services/madfi/utils";
import { groupBy } from "lodash";
import { getProfilesByOwners } from "@src/services/lens/getProfiles";

export const useGetClubHoldings = (clubId: string, page: number, chain = "base") => {
  return useQuery({
    queryKey: ["club-holdings", clubId, page],
    queryFn: async () => {
      const res = await getClubHoldings(clubId!, page, chain);
      const profiles = await getProfilesByOwners(res.holdings?.map(({ trader }) => trader.id));
      const profilesGrouped = groupBy(profiles, 'owner');

      const holdings = await Promise.all(res.holdings?.map(async (trade) => {
        const address = getAddress(trade.trader.id);
        const profile = profilesGrouped[address] ? profilesGrouped[address][0] : undefined;
        return { ...trade, profile };
      }));

      return { holdings, hasMore: res.hasMore };
    },
    enabled: !!clubId,
    staleTime: 20000,
    gcTime: 60000 * 5,
  });
};

export const useGetBuyPrice = (account?: `0x${string}`, clubId?: string, amount?: string, chain = "base") => {
  return useQuery({
    queryKey: ["buy-price", clubId, amount],
    queryFn: () => getBuyPrice(account!, clubId!, amount!, undefined, chain),
    enabled: !!clubId && !!amount,
    refetchInterval: 15000, // refetch every 15 seconds
    staleTime: 2000,
    gcTime: 15000,
  });
};

export const useGetBuyAmount = (account?: `0x${string}`, tokenAddress?: `0x${string}`, spendAmount?: string, chain = "base", options?: { initialPrice?: string, targetPriceMultiplier?: string, flatThreshold?: string, completed?: boolean }) => {
  return useQuery({
    queryKey: ["buy-amount", tokenAddress, spendAmount],
    queryFn: () => getBuyAmount(account!, tokenAddress!, spendAmount!, undefined, chain, options),
    enabled: !!tokenAddress && !!spendAmount && !!account && !options?.completed,
    refetchInterval: 5000, // refetch every 5 seconds
    staleTime: 1000,
    gcTime: 5000,
  });
};

export const useRegisteredClubByToken = (tokenAddress?: `0x${string}`, chain?: string) => {
  return useQuery({
    queryKey: ["registered-club-token", tokenAddress, chain],
    queryFn: () => getRegisteredClubById("", chain, tokenAddress),
    enabled: !!tokenAddress && !!chain,
    staleTime: 10000,
    gcTime: 60000,
  });
};

export const useGetClubBalance = (
  clubId?: string,
  address?: `0x${string}`,
  chain = "base",
  complete?: boolean,
  tokenAddress?: `0x${string}`,
) => {
  return useQuery({
    queryKey: ["club-balance", clubId, address],
    queryFn: () => getBalance(clubId!, address!, chain, complete, tokenAddress),
    enabled: (!!clubId && !!address) || tokenAddress == PROTOCOL_DEPLOYMENT.lens.Bonsai,
    staleTime: 10000,
    gcTime: 60000,
  });
};

export const useGetRegistrationFee = (
  amount: number | string,
  account?: `0x${string}`,
  chain = "base",
  pricingTier?: string,
) => {
  return useQuery({
    queryKey: ["registration-fee", amount, account],
    queryFn: () => getRegistrationFee(amount.toString()!, account!, chain, pricingTier),
    enabled: !!account,
    staleTime: 1000,
    gcTime: 2000,
  });
};

export const useGetSellPrice = (account?: `0x${string}`, clubId?: string, amount?: string, chain = "base") => {
  return useQuery({
    queryKey: ["sell-price", clubId, amount],
    queryFn: () => getSellPrice(account!, clubId!, amount!, false, chain),
    enabled: !!clubId && !!amount && !!account,
    staleTime: 1000,
    gcTime: 15000,
  });
};

type TradingInfoResponse = {
  name: string;
  symbol: string;
  image: string;
  createdAt: string;
  buyPrice: string;
  volume24Hr: string;
  liquidity: string;
  marketCap: string;
  holders: number;
  graduated: boolean;
  priceDeltas: {
    [key: string]: string;
  };
};
export const useGetTradingInfo = (clubId?: number, chain = "base") => {
  return useQuery({
    queryKey: ["trading-info", clubId],
    queryFn: async () => {
      const data: TradingInfoResponse = await fetch(`/api/clubs/get-trading-info?clubId=${clubId}&chain=${chain}`).then(
        (response) => response.json(),
      );
      return data;
    },
    enabled: !!clubId && clubId !== 0,
    staleTime: 60000,
    gcTime: 60000 * 5,
  });
};

export const useGetRewardPool = (address: `0x${string}`) => {
  return useQuery({
    queryKey: ["reward-pool", address],
    queryFn: () => getRewardPool(address!),
    enabled: !!address,
    staleTime: 10000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
  });
};
