// Link moaicId to Namespace

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/OptParse';

const netType = NemConst.NETWORK_TYPE;

const is = (arg: string, prefix: string,  ) =>{
    return arg.slice(0,2) === prefix && Util.isHex(arg.slice(2)) && arg.length === 18;
};


const optParse = new DefaultOptParse();
optParse.subscribe(
    'aliasActionType',
    (arg: string) => { return arg === 'Link' || arg === 'Unlink' },
    (arg: string) => { return `${(<any>nem.AliasActionType)[arg]}` }
);
optParse.subscribe(
    'namespaceName',
    (arg: string) => { return (/^-n\w+$/).test(arg) },
    (arg: string) => { return arg.slice(2) }
);
optParse.subscribe(
    'mosaicId',
    (arg: string) => { return (/^-m[0-9A-Fa-f]{16}$/).test(arg) },
    (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();

const privateKey = option.get('privateKey');
const aliasActionType = option.get('aliasActionType');
const namespaceName = option.get('namespaceName');
const mosaicId = option.get('mosaicId');

// argument check
[privateKey, aliasActionType, namespaceName, mosaicId].forEach(arg => {
    if (Util.isUndefined(arg)) {
        console.error(`argument parse fault.`);
        process.exit(1);
    }
});

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

TxUtil.sendSinglesigTx(sender, mosaicAliasTx, NemConst.URL);
