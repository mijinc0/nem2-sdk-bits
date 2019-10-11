// ** USAGE **
//
//    $ ts-node SendTransferTransction.ts <private key> <recipient address> <amount> <mosaic id> <message>
//
//       amount : amount of mosaic
//    mosaic id : mosaic id that you want to send (optional, defalut = NemConst.CURRENCY_MOSAIC_ID )
//      message : '-m' + <message>
//        alias : '-a' + <alias>
//
//    (e.g) $ ts-node SendTransferTx.ts <your private key> SCJPIKELZEMCO6CJIFAHSB4RXPBDKHN6GFVMUM7A 100 -mhello

import * as nem from 'nem2-sdk'
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
  'amount',
  (arg: string) => { return (/^\d+$/).test(arg) },
  true
);
optParse.subscribe(
  'mosaicId',
  (arg: string) => { return (/^-m[0-9A-Fa-f]{16}$/).test(arg) },
  false,
  (arg: string) => { return arg.slice(2) },
  NemConst.CURRENCY_MOSAIC_ID
);
optParse.subscribe(
  'addressAlias',
  (arg: string) => { return (/^-a\w+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(2) }
);
optParse.subscribe(
  'message',
  (arg: string) => { return (/^-M.+$/).test(arg) },
  false,
  (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();

// create TransferTx //
const netType = NemConst.NETWORK_TYPE;

const sender = nem.Account.createFromPrivateKey(option.get('privateKey'), netType);
const recipientAliasId = option.get('addressAlias');
const recipient = new nem.NamespaceId(recipientAliasId);

// calc modaic id
const amount = parseInt(option.get('amount'));
const mosaicId = option.get('mosaicId');
const mosaic = new nem.Mosaic(new nem.MosaicId(mosaicId), nem.UInt64.fromUint(amount));
const mosaics = [mosaic];
const msg = option.get('message') ? option.get('message') : '';

console.log(` mosaicId : ${mosaicId}`);
console.log(`   amount : ${amount}`);
console.log(`recipient : ${recipientAliasId} (Alias)`);
console.log(`  message : ${msg}`);

const transferTx = nem.TransferTransaction.create(
  nem.Deadline.create(),
  recipient,
  mosaics,
  nem.PlainMessage.create(msg),
  netType
);

TxUtil.sendSinglesigTx(sender, transferTx, option.get('url'));
