import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { CryptoCurrencies } from '@shared/models/currencies.model';

import { marketDataQueryOptions } from '../market-data.query';

const currencyNameMap: Record<CryptoCurrencies, string> = {
  BIT: 'bitnet-io',
  STX: 'blockstack',
};

async function fetchCoingeckoMarketData(currency: CryptoCurrencies) {
  const resp = await axios.get(
`https://api.coingecko.com/api/v3/simple/price?ids=bitnet-io&vs_currencies=usd`
  );
  return resp.data;
}

export function selectCoingeckoUsdPrice(resp: any) {
  return (Object.values(resp)[0] as any)?.usd;
}

export function useCoinGeckoMarketDataQuery(currency: CryptoCurrencies) {
  return useQuery({
    queryFn: () => fetchCoingeckoMarketData(currency),
    queryKey: [`coin-gecko-market-data-${currency}`],
    ...marketDataQueryOptions,
  });
}
