import axios from 'axios';

class Configuration {
  constructor(public baseUrl: string) {}
}

export interface UtxoResponseItem {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
}

export interface UtxoWithDerivationPath extends UtxoResponseItem {
  derivationPath: string;
}

class AddressApi {
  constructor(public configuration: Configuration) {}

  async getTransactionsByAddress(address: string) {
    const resp = await axios.get(`https://bitexplorer.io/api/v1/address/${address}/txs`);
    return resp.data;
  }

  async getUtxosByAddress(address: string): Promise<UtxoResponseItem[]> {
    const resp = await axios.get<UtxoResponseItem[]>(
      `https://bitnft.io/api/address/${address}/utxo`
    );
    return resp.data.sort((a, b) => a.vout - b.vout);
  }
}

interface FeeEstimateEarnApiResponse {
  name: string;
  height: number;
  hash: string;
  time: string;
  latest_url: string;
  previous_hash: string;
  previous_url: string;
  peer_count: number;
  unconfirmed_count: number;
  high_fee_per_kb: number;
  medium_fee_per_kb: number;
  low_fee_per_kb: number;
  last_fork_height: number;
  last_fork_hash: string;
}
interface FeeEstimateMempoolSpaceApiResponse {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

interface FeeResult {
  fast: number;
  medium: number;
  slow: number;
}

class FeeEstimatesApi {
  constructor(public configuration: Configuration) {}

  async getFeeEstimatesFromBlockcypherApi(network: string): Promise<FeeResult> {
    const resp = await axios.get<FeeEstimateEarnApiResponse>(
      `https://bitexplorer.io/api/v1/fees/recommended`
    );
const { fastestFee, halfHourFee, hourFee } = resp.data;
    return {
      slow: hourFee,
      medium: halfHourFee,
      fast: fastestFee,
    };
  }

  async getFeeEstimatesFromMempoolSpaceApi(): Promise<FeeResult> {
    const resp = await axios.get<FeeEstimateMempoolSpaceApiResponse>(
      `https://bitexplorer.io/api/v1/fees/recommended`
    );
    const { fastestFee, halfHourFee, hourFee } = resp.data;
    return {
      slow: hourFee,
      medium: halfHourFee,
      fast: fastestFee,
    };
  }
}

class TransactionsApi {
  constructor(public configuration: Configuration) {}

  async getBitcoinTransaction(txid: string) {
    const resp = await axios.get(`${this.configuration.baseUrl}/tx/${txid}`);
    return resp.data;
  }

  async getBitcoinTransactionHex(txid: string) {
    const resp = await axios.get(`${this.configuration.baseUrl}/tx/${txid}/hex`, {
      responseType: 'text',
    });
    return resp.data;
  }

  async broadcastTransaction(tx: string) {
    // TODO: refactor to use `axios`
    // https://github.com/leather-wallet/extension/issues/4521
    // eslint-disable-next-line no-restricted-globals
    return fetch(`${this.configuration.baseUrl}/tx`, {
      method: 'POST',
      body: tx,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}

export class BitcoinClient {
  configuration: Configuration;
  addressApi: AddressApi;
  feeEstimatesApi: FeeEstimatesApi;
  transactionsApi: TransactionsApi;

  constructor(basePath: string) {
    this.configuration = new Configuration(basePath);
    this.addressApi = new AddressApi(this.configuration);
    this.feeEstimatesApi = new FeeEstimatesApi(this.configuration);
    this.transactionsApi = new TransactionsApi(this.configuration);
  }
}
