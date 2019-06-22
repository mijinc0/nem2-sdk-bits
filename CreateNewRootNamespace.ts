// ** USAGE **
// $ ts-node CreateNewRootNamespace.ts <private key> <namespace name> <duration>
//
// namespace name : required
//       duration : optional (default 100)
//
// (e.g) ts-node CreateNewRootNamespace.ts <your private key> mynamespace 1000

import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/OptParse';

const netType = NemConst.NETWORK_TYPE;
const optParse = new DefaultOptParse();
optParse.subscribe(
    'duration',
    (arg: string) => { return (/^\d*$/).test(arg) }
);
optParse.subscribe(
    'namespaceName',
    (arg: string) => { return (/^-n\w+$/).test(arg) },
    (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();
const privateKey = option.get('privateKey');
const namespaceName = option.get('namespaceName');

[privateKey, namespaceName].forEach(arg => {
    if (Util.isUndefined(arg)) {
        console.error(`argument parse fault.`);
        process.exit(1);
    }
});

const issuer = nem.Account.createFromPrivateKey(privateKey, netType);
const duration = option.get('duration') ? parseInt(option.get('duration')) : 100;

const registerNamespaceTx = nem.RegisterNamespaceTransaction.createRootNamespace(
    nem.Deadline.create(),
    namespaceName,
    nem.UInt64.fromUint(duration),
    netType
);

console.log(`namespace name : ${namespaceName}`);
console.log(`  namespace ID : ${new nem.NamespaceId(namespaceName).toHex()}`);
console.log(`      duration : ${duration}`);


const url = NemConst.URL;

TxUtil.sendSinglesigTx(issuer, registerNamespaceTx, url);
