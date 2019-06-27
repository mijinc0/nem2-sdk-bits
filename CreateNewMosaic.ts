// ** USAGE **
// $ ts-node CreateNewMosaic.ts <private key> <duration> <divisibility> <transferable> <supplyMutable> <levyMutable>
//
//   [ optional arguments ]
//     duration      : decimal number (default 100)
//     divisibility  : prefix "-d" + number (default 0)
//     transferable  : -t (default false)
//     supplyMutable : -s (defailt false)
//     levyMutable   : -l (defailt false)
//
// (e.g) ts-node CreateNewMosaic.ts <your private key> 1000 -d3 -t -s -l

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;
const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
    'duration',
    (arg: string) => { return (/^\d*$/).test(arg) },
);
optParse.subscribe(
    'divisibility',
    (arg: string) => { return (/^-d\d{1}$/).test(arg) },
    false,
    (arg: string) => { return arg.slice(2, 3) },
);
optParse.subscribe(
    'transferable',
    (arg: string) => { return arg === '-t' },
);
optParse.subscribe(
    'supplyMutable',
    (arg: string) => { return arg === '-s' }
);
const option = optParse.parse();
const privateKey = option.get('privateKey');
const issuer = nem.Account.createFromPrivateKey(privateKey, netType);

const duration = option.get('duration') ? parseInt(option.get('duration')) : 100;
const divisibility = option.get('divisibility') ? parseInt(option.get('divisibility')) : 0;
const transferable = option.get('transferable') ? true : false;
const supplyMutable = option.get('supplyMutable') ? true : false;

// create properties //
const properties = nem.MosaicProperties.create({
    duration: nem.UInt64.fromUint(duration),
    divisibility: divisibility,
    transferable: transferable,
    supplyMutable: supplyMutable,
});

// If you want to decide nonce => nem.MosaicNonce.createFromHex( '00000000' );
const mosaicNonce = nem.MosaicNonce.createRandom();
const mosaicID = nem.MosaicId.createFromNonce(mosaicNonce, issuer.publicAccount);

const mosaicDefTx = nem.MosaicDefinitionTransaction.create(
    nem.Deadline.create(),
    mosaicNonce,
    mosaicID,
    properties,
    netType,
);

// print infomations //

console.log(`issuer public key : ${issuer.publicKey}`);
console.log(`        mosaic ID : ${mosaicID.toHex()}`);
console.log(`     mosaic Nonce : ${mosaicNonce.nonce}`);
console.log('[mosaic feature]');
console.log(`         duration : ${duration}`)
console.log(`     divisibility : ${divisibility}`)
console.log(`     transferable : ${transferable}`)
console.log(`    supplyMutable : ${supplyMutable}`)

TxUtil.sendSinglesigTx(issuer, mosaicDefTx, option.get('url'));
