// ** USAGE **
// $ ts-node CreateNewRootNamespace.ts <private key> <namespace name> <duration>
//
// namespace name : '-n' + name
//       duration : optional (default 100)
//
// (e.g) ts-node CreateNewRootNamespace.ts <your private key> -nmynamespace 1000

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
    false,
    undefined,
    '100'
);
optParse.subscribe(
    'namespaceName',
    (arg: string) => { return (/^-n\w+$/).test(arg) },
    true,
    (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();
const privateKey = option.get('privateKey');
const namespaceName = option.get('namespaceName');

const issuer = nem.Account.createFromPrivateKey(privateKey, netType);
const duration = parseInt(option.get('duration'));

const registerNamespaceTx = nem.NamespaceRegistrationTransaction.createRootNamespace(
    nem.Deadline.create(),
    namespaceName,
    nem.UInt64.fromUint(duration),
    netType
);

console.log(`namespace name : ${namespaceName}`);
console.log(`  namespace ID : ${new nem.NamespaceId(namespaceName).toHex()}`);
console.log(`      duration : ${duration}`);

TxUtil.sendSinglesigTx(issuer, registerNamespaceTx, option.get('url'));
