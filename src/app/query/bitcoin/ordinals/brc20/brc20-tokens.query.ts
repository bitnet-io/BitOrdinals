import { useCallback, useEffect } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { createNumArrayOfRange } from '@app/common/utils';
import { QueryPrefixes } from '@app/query/query-prefixes';
import { useCurrentAccountNativeSegwitIndexZeroSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootSigner } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

const addressesSimultaneousFetchLimit = 5;
const stopSearchAfterNumberAddressesWithoutBrc20Tokens = 5;

export interface Brc20TokenResponse {
  tick: string
  available_balance: string
  transferrable_balance: string
  overall_balance: string
  decimals: number
}


export interface Brc20Token extends Brc20TokenResponse {
  decimals: number;
}



interface Brc20TokenTicker {
  ticker: {
    tick: string;
    max_supply: string;
    decimals: number;
    limit_per_mint: string;
    remaining_supply: string;
    deploy_incr_number: number;
  }[];
}



async function fetchTickerData(ticker: string): Promise<Brc20TokenTicker[]> {

 const res = await axios.get(`https://bitnft.io/ordinals/v1/bit-20/tokens/${ticker}`);
// const res = await axios.get(``);

			//testing with port 1717
			// const res = await axios.get(`http://bitexplorer.io:1717/fsck`);
  return res.data;
}

async function fetchBrc20TokensByAddress(address: string): Promise<Brc20Token[]> {
  const res = await axios.get(`https://bitnft.io/ordinals/v1/bit-20/balances/${address}`);
//  const res = await axios.get(``);

			// testing with port 1717
			//  const res = await axios.get(`http://bitexplorer.io:1717/bit1p6r4nsxdnh4slwr6w9j6m0h64jnelldyh548spqy97e0gv5x4lxyqpvr9a8`);
  const tokensData = res.data;

  const tickerPromises = tokensData.map((token: Brc20TokenResponse) => {
    return fetchTickerData(token.tick);
  });

  const tickerData = await Promise.all(tickerPromises);

  // add decimals to token data
  return tokensData.map((token: Brc20TokenResponse, index: number) => {
    return {
      ...token,
      decimals: tickerData[index].ticker[0].decimals,
    };
  });
}





export function useGetBrc20TokensQuery() {
  const network = useCurrentNetwork();
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroSigner();
  const currentBitcoinAddress = nativeSegwitSigner.address;
  const createSigner = useCurrentAccountTaprootSigner();
  const analytics = useAnalytics();

  if (!createSigner) throw new Error('No signer');

  const getNextTaprootAddressBatch = useCallback(
    (fromIndex: number, toIndex: number) => {
      return createNumArrayOfRange(fromIndex, toIndex - 1).map(num => {
        const address = createSigner(num).address;
        return address;
      });
    },
    [createSigner]
  );
  const query = useInfiniteQuery({
    queryKey: [QueryPrefixes.GetBrc20Tokens, currentBitcoinAddress, network.id],
    async queryFn({ pageParam }) {
      const fromIndex: number = pageParam?.fromIndex ?? 0;
      let addressesWithoutTokens = pageParam?.addressesWithoutTokens ?? 0;

      const addressesData = getNextTaprootAddressBatch(
        fromIndex,
        fromIndex + addressesSimultaneousFetchLimit
      );
      const brc20TokensPromises = addressesData.map(address => {
        return fetchBrc20TokensByAddress(address);
      });

      const brc20Tokens = await Promise.all(brc20TokensPromises);
      addressesWithoutTokens += brc20Tokens.filter(tokens => tokens.length === 0).length;

      return {
        addressesWithoutTokens,
        brc20Tokens,
        fromIndex,
      };
    },
    getNextPageParam(prevInscriptionQuery) {
      const { fromIndex, brc20Tokens, addressesWithoutTokens } = prevInscriptionQuery;

      if (addressesWithoutTokens >= stopSearchAfterNumberAddressesWithoutBrc20Tokens) {
        return undefined;
      }

      return {
        fromIndex: fromIndex + addressesSimultaneousFetchLimit,
        addressesWithoutTokens,
        brc20Tokens,
      };
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  // Auto-trigger next request
  useEffect(() => {
    void query.fetchNextPage();
  }, [query, query.data]);
  useEffect(() => {
    const brc20AcrossAddressesCount = query.data?.pages.reduce((acc, page) => {
      return acc + page.brc20Tokens.flatMap(item => item).length;
    }, 0);

    if (!query.hasNextPage && brc20AcrossAddressesCount && brc20AcrossAddressesCount > 0) {
      void analytics.identify({
        brc20_across_addresses_count: brc20AcrossAddressesCount,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, query.hasNextPage]);
  return query;
}
