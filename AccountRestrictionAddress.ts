// ** USAGE **
//
//    $ ts-node AccountRestrictionAddress.ts <private key> <address> <restrictionType> <Add|Remove>
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
optParse.subscribeAddress();
optParse.subscribe(
  'restrictionType',
  (arg: string) => { return nem.AccountRestrictionType.hasOwnProperty(arg) },
  true,
  (arg: string) => { return `${(<any>nem.AccountRestrictionType)[arg]}` }
);
optParse.subscribe(
  'modificationAction',
  (arg: string) => { return nem.AccountRestrictionModificationAction.hasOwnProperty(arg) },
  true,
  (arg: string) => { return `${(<any>nem.AccountRestrictionModificationAction)[arg]}` }
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const address = option.get('address');
const restrictionType = option.get('restrictionType'); // propertyType  : base of account property type. AllowAccount or BlockAccount(Deny)
const modificationAction = option.get('modificationAction'); // modificationType : modifications in "propertyType". Add or Remove

const modifiedAccount = nem.Account.createFromPrivateKey(privateKey, netType);
const targetAddress = nem.Address.createFromRawAddress(address);
const modifications = [
  nem.AccountRestrictionModification.createForAddress(parseInt(modificationAction), targetAddress)
];

const accountRestrictionTx = nem.AccountRestrictionTransaction.createAddressRestrictionModificationTransaction(
  nem.Deadline.create(),
  parseInt(restrictionType),
  modifications,
  netType
);

TxUtil.sendSinglesigTx(modifiedAccount, accountRestrictionTx, option.get('url'));
