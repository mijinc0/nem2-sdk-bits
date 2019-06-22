
// ** USAGE **
//    Link moaicId to Namespace
//
//    $ ts-node MosaicAliasTx.ts <private key> <mosaic ID> <namespace ID> <aliasActionType>
//
//          mosaic ID : '-m' + <hex mosaic ID>
//       namespace ID : '-n' + <hex namespace ID>
//    aliasActionType : Link or Unlink
//
//    $ ts-node MosaicAliasTx.ts <your private key> -m723bf76f4eeccab2 -n109f4a8fc8c83695 Link

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;

const is = (arg: string, prefix: string,  ) =>{
    return arg.slice(0,2) === prefix && Util.isHex(arg.slice(2)) && arg.length === 18;
};

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
    'aliasActionType',
    (arg: string) => { return arg === 'Link' || arg === 'Unlink' },
    true,
    (arg: string) => { return `${(<any>nem.AliasActionType)[arg]}` }
);
optParse.subscribe(
    'namespaceName',
    (arg: string) => { return (/^-n\w+$/).test(arg) },
    true,
    (arg: string) => { return arg.slice(2) }
);
optParse.subscribe(
    'mosaicId',
    (arg: string) => { return (/^-m[0-9A-Fa-f]{16}$/).test(arg) },
    true,
    (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const aliasActionType = option.get('aliasActionType');
const namespaceName = option.get('namespaceName');
const mosaicId = option.get('mosaicId');

const sender = nem.Account.createFromPrivateKey(privateKey, netType);

const mosaicAliasTx = nem.MosaicAliasTransaction.create(
    nem.Deadline.create(),
    parseInt(aliasActionType),
    new nem.NamespaceId(namespaceName),
    new nem.MosaicId(mosaicId),
    netType
);

console.log(`mosaic ID : ${mosaicId}`);
console.log(`namespace : ${namespaceName}`);
console.log(`   action : ${nem.AliasActionType[parseInt(aliasActionType)]}`);

const url = option.get('url');

TxUtil.sendSinglesigTx(sender, mosaicAliasTx, url);
