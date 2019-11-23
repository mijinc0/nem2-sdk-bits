import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;

const optParse = new DefaultOptParse();
optParse.subscribe(
  'txHash',
  (arg: string) => { return (/^--hash=[0-9A-Fa-f]{64}$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(7) }
);
const option = optParse.parse();

const hash = option.get('txHash');
const url = option.get('url');

const txHttp = new nem.TransactionHttp(url);
txHttp.getTransaction(hash).subscribe(
  (tx: nem.Transaction) => {
    const json = tx.toJSON();
    console.log(JSON.stringify(json, null , '  '));
  },
  (e: Error) => {
    console.error(e);
  }
);
