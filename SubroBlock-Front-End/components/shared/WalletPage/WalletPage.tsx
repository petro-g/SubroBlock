import Image from "next/image";
import React, { useEffect, useState } from "react";
import TableCardList from "@/components/shared/TableCardList/TableCardList";
import {
  useTableDataProps
} from "@/components/shared/TableCardList/use-table-data-props";
import { useRootTransactionsTableColumnsDef } from "@/components/shared/WalletPage/useRootTransactionsTableColumnsDef";
import WalletCoinsLineChart from "@/components/shared/WalletPage/WalletCoinsLineChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import FileIcon from "@/public/file-orange.svg";
import WalletIcon from "@/public/wallet-orange.svg";
import { useRootTransactionsStore } from "@/store/useRootTransactionsStore";
import { useRootWalletStore } from "@/store/useRootWalletStore";

export default function WalletPage() {
  const currentUser = useCurrentUser();
  const {
    balance,
    fetchRootWalletBalance,
    rootBuyBalance,
    rootSellBalance
  } = useRootWalletStore();

  const {
    fetchTransactions,
    lastFetchParams,
    transactions,
    transactionsTotalCount
  } = useRootTransactionsStore();

  const {
    page,
    setPage,
    pageSize,
    sorting,
    setSorting,
    searchParams,
    loading,
    withLoadingDelayed
  } = useTableDataProps({ lastFetchParams });

  useEffect(() => {
    if (currentUser?.roles) {
      withLoadingDelayed(async () => fetchTransactions(
        currentUser,
        searchParams))
    }}, [currentUser?.roles, balance?.balance, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const columnsDef = useRootTransactionsTableColumnsDef({ setSorting, sorting });

  useEffect(() => {
    withLoadingDelayed(async () => await fetchRootWalletBalance());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");

  const handleBuy = () => {
    if (currentUser) {
      rootBuyBalance(currentUser, Number(buyAmount));
      setBuyAmount("");
    }
  }

  const handleSell = () => {
    if (currentUser) {
      rootSellBalance(currentUser, Number(sellAmount));
      setSellAmount("");
    }
  }

  return (
    <div>
      <div className="flex mb-6 justify-end items-center">
        <Button variant="outline">
          Download Wallet Data
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-background p-6 rounded flex gap-4 items-center">
          <Image
            className="rounded-full bg-accent w-12 h-12 p-3"
            src={WalletIcon}
            alt="Wallet Icon"
          />
          <div className="flex flex-col gap-1.5 w-full">
            <span>Current Balance</span>
            {loading || balance === null
              ? <Skeleton className="w-20 h-6" />
              : <h3 className="h-6">{balance.balance || 0} SubroCoins</h3>
            }
          </div>
        </div>
        <div className="bg-background p-6 rounded flex gap-4 items-center">
          <Image
            className="rounded-full bg-accent w-12 h-12 p-3"
            src={FileIcon}
            alt="File Icon"
          />
          <div className="flex flex-col gap-1.5">
            <span>Total Pending Offers</span>
            {loading || balance === null
              ? <Skeleton className="w-20 h-6" />
              : <h3 className="h-6">{balance.pendingSentOffers || 0}</h3>
            }
          </div>
        </div>
        <div className="bg-background p-6 rounded flex gap-4 items-center">
          <Image
            className="rounded-full bg-accent w-12 h-12 p-3"
            src={FileIcon}
            alt="File Icon"
          />
          <div className="flex flex-col gap-1.5">
            <span>Total Received Offers</span>
            {loading || balance === null
              ? <Skeleton className="w-20 h-6" />
              : <h3 className="h-6">{balance.pendingReceivedOffers || 0}</h3>
            }
          </div>
        </div>
      </div>
      <div className="flex w-full mt-8">
        <div className="w-full mr-5 flex justify-center items-center">
          <WalletCoinsLineChart/>
        </div>
        <div className="bg-background rounded min-w-80 p-6 flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3>Buy SubroCoins</h3>
              <p>$USD Amount</p>
            </div>
            <Input
              placeholder="0.00"
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleBuy}
              disabled={Number(buyAmount) <= 0}
            >
              Buy
            </Button>
          </div>
          <div className="h-[1px] bg-secondary" />
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3>Sell SubroCoins</h3>
              <p>$USD Amount</p>
            </div>
            <Input
              placeholder="0.00"
              type="number"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={handleSell}
              disabled={Number(sellAmount) <= 0}
            >
              Sell
            </Button>
          </div>
        </div>
      </div>
      <TableCardList
        title="Transactions"
        data={transactions}
        columns={columnsDef}
        loading={loading}
        pageSize={pageSize}
        page={page}
        setPage={setPage}
        count={transactionsTotalCount}
      />
    </div>
  );
}
