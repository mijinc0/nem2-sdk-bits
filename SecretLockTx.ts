// ** USAGE **
//
//    $ ts-node SecretLockTx.ts <private key> <recipient address> <secret> <duration> <hashType>
//
//      secret : '-s' + 32byte hex
//    duration : decimal
//    hashType : Op_Hash_160, Op_Hash_256, Op_Keccak_256, Op_Sha3_256
//
//    (e.g) ts-node SecretLockTx.ts <your private key> SDKULPDW7V27BI2IDNFQAYRTKIPWCO7VFTKF37NC -s4f43462ed6eec19fb12dfbd80f7fccaaceb3faaba8c1c169a0b63a6cd0aa3950 Op_Sha3_256

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const currencyMosaicId = new nem.MosaicId(NemConst.CURRENCY_MOSAIC_ID);

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribeAddress();
optParse.subscribe(
  `secret`,
  (arg: string) => { return (/^-s[0-9A-Fa-f]{64}$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(2) }
);
optParse.subscribe(
  'duration',
  (arg: string) => { return (/^\d*$/).test(arg) },
);
optParse.subscribe(
  'hashType',
  (arg: string) => { return !(/^\d*$/).test(arg) && Object.keys(nem.HashType).includes(arg) },
  true,
  (arg: string) => { return `${(<any>nem.HashType)[arg]}` }
);
const option = optParse.parse();
const privateKey = option.get('privateKey');
const sender = nem.Account.createFromPrivateKey(privateKey, netType);

const lockedMosaic = new nem.Mosaic(currencyMosaicId, nem.UInt64.fromUint(1000));
const duration = option.get('duration') ? parseInt(option.get('duration')) : 100;
// 746869734973536563726574 = Sha3_256 => 4f43462ed6eec19fb12dfbd80f7fccaaceb3faaba8c1c169a0b63a6cd0aa3950
// secret should be 32byte-hex
const recipient = nem.Address.createFromRawAddress(option.get('address'));;

const secretLockTx = nem.SecretLockTransaction.create(
  nem.Deadline.create(),
  lockedMosaic,
  nem.UInt64.fromUint(duration),
  parseInt(option.get('hashType')),
  option.get('secret'),
  recipient,
  netType
);

TxUtil.sendSinglesigTx(sender, secretLockTx, option.get('url'));
