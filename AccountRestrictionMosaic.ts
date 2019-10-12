// ** USAGE **
//    Transaction Blocking Property
//
//    $ ts-node AccountRestrictionMosaic.ts <private key> <AllowMocaic|BlockMosaic> <Add|Remove> <MosaicId( 8byte-hex )>
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
  (arg: string) => { return arg === 'AllowMosaic' || arg === 'BlockMosaic' },
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
  'mosaicId',
  (arg: string) => { return Util.isHex(arg) && arg.length === 16 },
  true
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const restrictionType = option.get('restrictionType');
const modificationType = option.get('modificationType');
const hexMosaicId = option.get('mosaicId');

const modifiedAccount = nem.Account.createFromPrivateKey(privateKey, netType);
const modifiedMosaicId = new nem.MosaicId(hexMosaicId);
const modifications = [
  nem.AccountRestrictionModification.createForMosaic(parseInt(modificationType), modifiedMosaicId)
];

const accountRestrictionTx = nem.AccountRestrictionTransaction.createMosaicRestrictionModificationTransaction(
  nem.Deadline.create(),
  parseInt(restrictionType),
  modifications,
  netType
);

TxUtil.sendSinglesigTx(modifiedAccount, accountRestrictionTx, option.get('url'));
