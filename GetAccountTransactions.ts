import * as nem from 'nem2-sdk';
import { DefaultOptParse } from './share/DefaultOptParse';

const optParse = new DefaultOptParse();
optParse.subscribeAddress();
optParse.subscribe(
  'pageSize',
  (arg: string) => { return (/^--pageSize=\d*$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(11) }
);
optParse.subscribe(
  'id',
  (arg: string) => { return (/^--id=\w*$/).test(arg) },
  false,
  (arg: string) => { return arg.slice(5) },
  ''
);
const option = optParse.parse();
const url = option.get('url');
const address = nem.Address.createFromRawAddress(option.get('address'));
// quety params
const pageSize = parseInt(option.get('pageSize'));
const id = option.get('id');
const queryParams = new nem.QueryParams(pageSize, id);
console.log(`== QuetyParams ==\npageSize : ${queryParams.pageSize}\nid : ${queryParams.id}`);
const accountHttp = new nem.AccountHttp(url);
accountHttp.getAccountOutgoingTransactions(address, queryParams).subscribe(
  (x) => {
    console.log(`== OutgoingTx (${x.length}) ==`);
    x.forEach((tx: nem.Transaction) => console.log(`${tx.transactionInfo.id}  ${tx.transactionInfo.hash}`))
  },
  e => console.error(e)
);
accountHttp.getAccountIncomingTransactions(address, queryParams).subscribe(
  (x) => {
    console.log(`== IncomingTx (${x.length}) ==`);
    x.forEach((tx: nem.Transaction) => console.log(`${tx.transactionInfo.id}  ${tx.transactionInfo.hash}`))
  },
  e => console.error(e)
);
