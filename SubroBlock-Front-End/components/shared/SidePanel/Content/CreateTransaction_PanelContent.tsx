"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IOption } from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import { InputDropdownOptions } from "@/components/shared/InputDropdownOptions";
import dropdownSearchedOptionRenderer from "@/components/shared/InputDropdownOptions/dropdownSearchedOptionRenderer";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { ResponseAPI } from "@/lib/fetchAPI";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import useDelay from "@/lib/hooks/useDelay";
import useLoading from "@/lib/hooks/useLoading";
import { currentUserHasSomeRoles } from "@/lib/utils";
import { IWallet } from "@/store/types/wallet";
import { useAdminTransactionsStore } from "@/store/useAdminTransactionsStore";
import { useRootWalletStore } from "@/store/useRootWalletStore";
import { useSidePanelStore } from "@/store/useSidePanelStore";

const formNewTransactionSchema = z.object({
  originName: z.string(),
  destinationName: z.string(),
  subroCoin: z.string()
});

// const fetchWalletsSearchFactory = (debounce: ReturnType<typeof useDelay>["delay"], lastFetchWalletParams: { search: string }, fetchWallets: (params: { search: string }) => void, destinationName: string) => {
//   const delayMs = lastFetchWalletParams.search === destinationName ? 0 : 1000;
//   debounce(() => fetchWallets({ search: destinationName }), delayMs);
// };

const walletOptionFactory = (wallet: IWallet, searchValue: string) => ({
  value: `${wallet.walletId}`,
  label: `${wallet.walletName || wallet.walletId}`,
  render: option => dropdownSearchedOptionRenderer(option, searchValue)
}) as IOption;

const CreateTransaction_PanelContent =  () => {
  const { moveCoins, createCoins } = useAdminTransactionsStore();

  const {
    fetchWallets,
    lastFetchWalletParams
  } = useRootWalletStore();

  const { setOpenPanel } = useSidePanelStore();
  const currentUser = useCurrentUser();

  const form = useForm({
    defaultValues: {
      originName: "",
      destinationName: "",
      subroCoin: ""
    },
    resolver: zodResolver(formNewTransactionSchema)
  });

  const [ loading, withLoading ] = useLoading<ResponseAPI>();
  const [tab, setTab] = React.useState<string | "createTransaction" | "createCoins">("createTransaction");

  // Wallets in each input are fetched separately, because each of them has different search value

  const { delay: delayOrigin } = useDelay();
  const [originWallets, setOriginWallets] = React.useState<IWallet[]>([]);
  const originName = form.watch("originName");
  useEffect(() => {
    const delayMs = lastFetchWalletParams.search === originName ? 0 : 1000;
    delayOrigin(async () => {
      const { data } = await fetchWallets({ search: originName });
      setOriginWallets(data?.data || []);
    }, delayMs);
  }, [originName]);// eslint-disable-line react-hooks/exhaustive-deps
  const originNameOptions = originWallets.map(wallet => walletOptionFactory(wallet, originName));

  const { delay: delayDestination } = useDelay();
  const [destinationWallets, setDestinationWallets] = React.useState<IWallet[]>([]);
  const destinationName = form.watch("destinationName");
  useEffect(() => {
    const delayMs = lastFetchWalletParams.search === destinationName ? 0 : 1000;
    delayDestination(async () => {
      const { data } = await fetchWallets({ search: destinationName });
      setDestinationWallets(data?.data || []);
    }, delayMs);
  }, [destinationName]);// eslint-disable-line react-hooks/exhaustive-deps
  const destinationNameOptions = destinationWallets?.map(wallet => walletOptionFactory(wallet, destinationName));

  async function onSubmit(values: z.infer<typeof formNewTransactionSchema>) {
    if (!currentUser)
      return;

    switch (tab) {
      default:
      case "createTransaction": {
        const originWalletId = originNameOptions?.find(option => option.label === values.originName || option.value === values.originName)?.value;
        const destinationWalletId = destinationNameOptions?.find(option => option.label === values.destinationName || option.value === values.destinationName)?.value;

        if (!originWalletId || !destinationWalletId) {
          toast({
            title: "Error",
            description: `Please select ${!originWalletId ? "origin" : "destination"} wallet`,
            variant: "error"
          })
          return;
        }

        const response = await withLoading(async () => moveCoins(
          currentUser,
          originWalletId,
          destinationWalletId,
          parseInt(values.subroCoin) || 0
        ));

        if (response.ok)
          setOpenPanel(null);
        break;
      }
      case "createCoins": {
        const destinationWalletId = destinationNameOptions?.find(option => option.label === values.destinationName || option.value === values.destinationName)?.value;

        if (!destinationWalletId) {
          toast({
            title: "Error",
            description: "Please select destination wallet",
            variant: "error"
          })
          return;
        }

        const response = await withLoading(async () => createCoins(
          destinationWalletId || "",
          parseInt(values.subroCoin) || 0
        ));

        if (response.ok)
          setOpenPanel(null);
        break;
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs
          value={tab}
          onValueChange={tab => setTab(tab)}
        >
          {currentUserHasSomeRoles(currentUser, ["admin", "org_root"]) && (
            <TabsList className="w-full mb-4 -mt-6">
              <TabsTrigger value="createTransaction" className="w-full">
                Create Transaction
              </TabsTrigger>
              <TabsTrigger value="createCoins" className="w-full">
                Mint SubroCoin
              </TabsTrigger>
            </TabsList>
          )}
          <TabsContent
            className="flex flex-col gap-4"
            value="createTransaction"
          >
            <FormField
              name="originName"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="originName" className="text-sm">
                    Origin Name
                  </FormLabel>
                  <FormControl>
                    <InputDropdownOptions
                      options={originNameOptions}
                      inputProps={{
                        placeholder: "Enter origin name",
                        ...field
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="destinationName"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="destinationName" className="text-sm">
                    Destination Name
                  </FormLabel>
                  <FormControl>
                    <InputDropdownOptions
                      options={destinationNameOptions}
                      inputProps={{
                        placeholder: "Enter destination name",
                        ...field
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="subroCoin"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="subroCoin" className="text-sm">
                    SubroCoin Amount
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      id="amount"
                      placeholder="Enter amount"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent
            className="flex flex-col gap-4"
            value="createCoins"
          >
            <FormField
              name="destinationName"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="destinationName" className="text-sm">
                    Destination Name
                  </FormLabel>
                  <FormControl>
                    <InputDropdownOptions
                      options={destinationNameOptions}
                      inputProps={{
                        placeholder: "Enter destination name",
                        ...field
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="subroCoin"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="subroCoin" className="text-sm">
                    SubroCoin Mint Amount
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      id="subroCoin"
                      placeholder="Enter amount"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        <Button
          type="submit"
          className="w-full mt-4"
          disabled={loading || !form.formState.isValid}
        >
          Create Transaction
        </Button>
      </form>
    </Form>
  );
};
export default CreateTransaction_PanelContent;
