import { useMemo, useState } from "react";
import { useGetBuyPrice, useGetClubBalance, useGetClubHoldings } from "@src/hooks/useMoneyClubs";
import { BuySellWidget } from "./BuySellWidget";

interface TradeComponentProps {
  club: any;
  address: `0x${string}` | undefined;
  onBuyUSDC?: () => void;
  defaultBuyAmount?: string;
  mediaProtocolFeeRecipient?: string;
  useRemixReferral?: `0x${string}`;
  closeModal?: () => void;
  postId?: string;
  inputToken?: string;
}

const TradeComponent = ({ club, address, onBuyUSDC, defaultBuyAmount, mediaProtocolFeeRecipient, useRemixReferral, closeModal, postId, inputToken }: TradeComponentProps) => {
  const [friendCount, setFriendCount] = useState(0);
  const { data: clubBalance, refetch: refetchClubBalance } = useGetClubBalance(club?.clubId, address, club.chain, club.complete, club.tokenAddress);
  const { data: clubHoldings, isLoading: isLoadingClubHoldings } = useGetClubHoldings(club?.clubId, 0, club.chain); // get only the first page, to see which friends holding
  const { refetch: refetchClubPrice } = useGetBuyPrice(address, club?.clubId, "1", club.chain);

  if (!club?.createdAt) return null;

  return (
    <div className="flex flex-col sm:min-w-[350px] max-w-screen">
      {" "}
      {/* Use flex container with full height */}
      <div className="flex-grow pb-2">
        {" "}
        {/* This div will grow to take available space, pushing the friends component to the bottom */}
        <BuySellWidget
          refetchClubBalance={refetchClubBalance}
          refetchClubPrice={refetchClubPrice}
          club={club}
          clubBalance={clubBalance}
          openTab={1}
          onBuyUSDC={onBuyUSDC}
          defaultBuyAmount={defaultBuyAmount}
          mediaProtocolFeeRecipient={mediaProtocolFeeRecipient}
          useRemixReferral={useRemixReferral}
          closeModal={closeModal}
          postId={postId}
        />
      </div>
    </div>
  );
};

export default TradeComponent;