// ** USAGE **
//    Transaction Blocking Property
//
//    $ ts-node AccountRestrictionOperation.ts <private key> <AllowTransaction|BlockTransaction> <Add|Remove> <TransationType>
//
//    ( All arguments (4 args) are required.)
//

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
  'restrictionType',
  (arg: string) => { return nem.AccountRestrictionType.hasOwnProperty(arg) },
  true,
  (arg: string) => { return `${(<any>nem.AccountRestrictionType)[arg]}` }
);
optParse.subscribe(
  'modificationType',
  (arg: string) => { return nem.AccountRestrictionModificationAction.hasOwnProperty(arg) },
  true,
  (arg: string) => { return `${(<any>nem.AccountRestrictionModificationAction)[arg]}` }
);
optParse.subscribe(
  'txType',
  (arg: string) => { return nem.TransactionType.hasOwnProperty(arg) },
  true,
  (arg: string) => { return `${(<any>nem.TransactionType)[arg]}` }
);
const option = optParse.parse();


const privateKey = option.get('privateKey');
const restrictionType = option.get('restrictionType');
const modificationType = option.get('modificationType');
const txType = option.get('txType');


const modifiedAccount = nem.Account.createFromPrivateKey(privateKey, netType);
const modifications = [
  nem.AccountRestrictionModification.createForOperation(parseInt(modificationType), parseInt(txType))
];

const accountRestrictionTx = nem.AccountRestrictionTransaction.createOperationRestrictionModificationTransaction(
  nem.Deadline.create(),
  parseInt(restrictionType),
  modifications,
  netType
);

TxUtil.sendSinglesigTx(modifiedAccount, accountRestrictionTx, option.get('url'));
