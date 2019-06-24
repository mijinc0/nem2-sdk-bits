// ** USAGE **
//
//    $ ts-node MosicSupplyChangeTx.ts <private key> <mosaic ID> <delta>
//
//    (e.g)
//    Increase $ ts-node MosaicSupplyChangeTx.ts <your private key> 7771977fd9fef432 +1000
//    Dcrease  $ ts-node MosaicSupplyChangeTx.ts <your private key> 7771977fd9fef432 -1000

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
    'mosaicId',
    (arg: string) => { return Util.isHex(arg) && arg.length === 16 },
    true
);
optParse.subscribe(
    'delta',
    (arg: string) => { return (/^(-|\+)\d+$/).test(arg) },
    true
);
const option = optParse.parse();

const sender = nem.Account.createFromPrivateKey(option.get('privateKey'), netType);
const mosaicId = new nem.MosaicId(option.get('mosaicId'));
const modificationType = option.get('delta')[0] === '+' ? nem.MosaicSupplyType.Increase : nem.MosaicSupplyType.Decrease ;
const delta = parseInt( option.get('delta').slice(1) );

const mosaicSupplyChangeTx = nem.MosaicSupplyChangeTransaction.create(
    nem.Deadline.create(),
    mosaicId,
    modificationType,
    nem.UInt64.fromUint(delta),
    netType
);

TxUtil.sendSinglesigTx(sender, mosaicSupplyChangeTx, option.get('url'));
