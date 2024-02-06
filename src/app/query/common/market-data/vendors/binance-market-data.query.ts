import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { CryptoCurrencies } from '@shared/models/currencies.model';

import { marketDataQueryOptions } from '../market-data.query';

async function fetchBinanceMarketData(currency: CryptoCurrencies) {
  const resp = await axios.get(
`https://api.xeggex.com/api/v2/market/getbysymbol/BIT_USDT`

  );
  return resp.data;
}

export function selectBinanceUsdPrice(resp: any) {
//  return resp?.price;
  return resp?.lastPrice;
}

export function useBinanceMarketDataQuery(currency: CryptoCurrencies) {
  return useQuery({
    queryFn: () => fetchBinanceMarketData(currency),
    queryKey: [`binance-market-data-${currency}`],
    ...marketDataQueryOptions,
  });
}
