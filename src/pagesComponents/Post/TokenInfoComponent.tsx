import clsx from 'clsx';
import { formatUnits } from "viem";
import { ReactNode, useState } from "react";
import { Subtitle, BodySemiBold, Header2 } from "@src/styles/text";
import { Club, DECIMALS, USDC_DECIMALS } from "@src/services/madfi/moneyClubs";
import { localizeNumber } from '@src/constants/utils';
import { useGetTradingInfo, useGetClubBalance } from "@src/hooks/useMoneyClubs";
import Link from 'next/link';
import { Button } from '@src/components/Button';
import { useAccount } from 'wagmi';
import { SmartMedia } from '@src/services/madfi/studio';
import { kFormatter } from '@src/utils/utils';
import { brandFont } from '@src/fonts/fonts';
import dynamic from 'next/dynamic';

const BuySellModal = dynamic(() => import('@pagesComponents/Club/BuySellModal'), { ssr: false });

enum PriceChangePeriod {
  twentyFourHours = '24h',
}

export const TokenInfoComponent = ({ club, media, remixPostId, postId }: { club: Club, media?: SmartMedia, remixPostId?: string, postId?: string }) => {
  const { address, isConnected } = useAccount();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyUSDCModalOpen, setBuyUSDCModalOpen] = useState(false);
  const [usdcBuyAmount, setUsdcBuyAmount] = useState<string>('');
  const [usdcAmountNeeded, setUsdcAmountNeeded] = useState<number>(0);
  const { data: tradingInfo } = useGetTradingInfo(club.clubId, club.chain);
  const { data: clubBalance } = useGetClubBalance(club.clubId.toString(), address, club.chain, club.complete, club.tokenAddress);
  const _DECIMALS = club.chain === "lens" ? DECIMALS : USDC_DECIMALS;

  const InfoCard: React.FC<{ title?: string; subtitle: ReactNode, roundedLeft?: boolean, roundedRight?: boolean, className?: string }> = ({ title, subtitle, roundedLeft, roundedRight, className }) => (
    <div className={clsx("min-w-[88px] flex flex-col items-center justify-center border border-card-light py-2 gap-y-1 px-4 bg-card-light", roundedLeft && 'rounded-l-xl', roundedRight && 'rounded-r-xl sm:rounded-none', className || "")}>
      {title ? (
        <>
          <Subtitle className="text-xs whitespace-nowrap">{title}</Subtitle>
          <span>{subtitle}</span>
        </>
      ) : (
        <div className="h-8 flex items-center">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );

  const ActionCard: React.FC<{ onClick: (e: any) => void }> = ({ onClick }) => (
    <div className="min-w-[88px] flex flex-col items-center justify-center border border-card-light py-2 space-y-1 px-4 bg-card-light rounded-l-xl sm:rounded-l-none rounded-r-xl hover:!bg-bullish cursor-pointer transition-colors duration-200 ease-in-out">
      <div className="h-8 flex items-center pt-1">
        <Button
          variant="dark-grey"
          size="md"
          onClick={onClick}
          disabled={!isConnected}
          className={`!bg-transparent hover:!bg-transparent !border-none !text-white/80 ${brandFont.className}`}
        >
          Buy
        </Button>
      </div>
      {/* filler to match height of infocard */}
      <div></div>
    </div>
  );

  const PriceChangeString: React.FC<{ period: PriceChangePeriod }> = ({ period }) => {
    const priceDelta = tradingInfo && tradingInfo.priceDeltas?.[period] ? tradingInfo.priceDeltas[period] : "0";

    let textColorClass = 'text-white/60';
    if (priceDelta !== "0" && priceDelta !== "-0") {
      textColorClass = priceDelta.includes("+") ? "!text-bullish" : "!text-bearish";
    }

    return (
      <Subtitle className={textColorClass}>
        {localizeNumber(Number(priceDelta) / 100, "percent")}
      </Subtitle>
    );
  };

  return (
    <div className="md:col-span-3s rounded-3xl animate-fade-in-down">
      <div className="relative w-full h-[126px] md:h-[63px] rounded-t-3xl bg-true-black overflow-hidden bg-clip-border">
        <div className="absolute inset-0" style={{ filter: 'blur(40px)' }}>
          <img
            src={club.token.image}
            alt={club.token.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-true-black to-transparent" />

        <div className="relative z-10 p-2 pb-4 flex flex-col">
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center w-full">
            <div className="w-full flex justify-between">
              {/* <Tooltip message="View Token" direction="right"> */}
              <Link href={`/token/${club.chain}/${club.tokenAddress}`}>
                <div className='flex items-center gap-x-4 w-full'>
                  <img
                    src={club.token.image}
                    alt={club.token.name}
                    className="w-[48px] h-[48px] object-cover rounded-lg"
                  />
                  <div className="flex flex-col items-start">
                    <Header2 className="text-white text-md">${club.token.symbol}</Header2>
                    <BodySemiBold className="text-white/60 text-sm">{club.token.name}</BodySemiBold>
                  </div>
                </div>
              </Link>
              {/* </Tooltip> */}
              <div className='sm:hidden'>
                <ActionCard onClick={(e) => setShowBuyModal(true)} />
              </div>

            </div>


            <div className="flex flex-row items-center mr-2">
              <InfoCard
                title='Market Cap'
                subtitle={<Subtitle>{!tradingInfo?.marketCap ? '-' : localizeNumber(parseFloat(formatUnits(BigInt(tradingInfo.marketCap), _DECIMALS)).toString(), 'currency', 2)}</Subtitle>}
                roundedLeft
              />
              <InfoCard
                title='24h'
                subtitle={<PriceChangeString period={PriceChangePeriod.twentyFourHours} />}
              />
              <InfoCard
                title='Balance'
                subtitle={<Subtitle>{!clubBalance ? '-' : kFormatter(parseFloat(formatUnits(clubBalance, _DECIMALS)))}</Subtitle>}
                roundedRight
              />
              <div className='hidden sm:block'>
                <ActionCard onClick={(e) => setShowBuyModal(true)} />
              </div>
            </div>
          </div>
        </div>

        <BuySellModal
          club={club}
          address={address as string}
          open={showBuyModal}
          onClose={() => {
            setShowBuyModal(false);
          }}
          mediaProtocolFeeRecipient={media?.protocolFeeRecipient}
          useRemixReferral={!!remixPostId ? media?.creator : undefined}
          onBuyUSDC={(amount: string) => {
            setUsdcBuyAmount(amount)
            setUsdcAmountNeeded(amount)
            setShowBuyModal(false)
            setBuyUSDCModalOpen(true)
          }}
          postId={postId}
        />
      </div>
    </div>
  );
};