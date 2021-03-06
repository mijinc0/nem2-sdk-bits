// ** USAGE **
//    Link moaicId to Namespace
//
//    $ ts-node MosaicAliasTx.ts <private key> <mosaic ID> <namespace name> <aliasActionType>
//
//          mosaic ID : '-m' + <hex mosaic ID>
//       namespace ID : '-n' + <namespace name>
//    aliasActionType : Link or Unlink
//
//    $ ts-node MosaicAliasTx.ts <your private key> -m723bf76f4eeccab2 -ndragon Link

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;

const optParse = new DefaultOptParse();
optParse.subscribePrivateKey();
optParse.subscribe(
    'aliasAction',
    (arg: string) => { return arg === 'Link' || arg === 'Unlink' },
    true,
    (arg: string) => { return `${(<any>nem.AliasAction)[arg]}` }
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
const aliasAction = option.get('aliasAction');
const namespaceName = option.get('namespaceName');
const mosaicId = option.get('mosaicId');

const sender = nem.Account.createFromPrivateKey(privateKey, netType);

const mosaicAliasTx = nem.MosaicAliasTransaction.create(
    nem.Deadline.create(),
    parseInt(aliasAction),
    new nem.NamespaceId(namespaceName),
    new nem.MosaicId(mosaicId),
    netType
);

console.log(`mosaic ID : ${mosaicId}`);
console.log(`namespace : ${namespaceName}`);
console.log(`   action : ${nem.AliasAction[parseInt(aliasAction)]}`);

const url = option.get('url');

TxUtil.sendSinglesigTx(sender, mosaicAliasTx, url);
