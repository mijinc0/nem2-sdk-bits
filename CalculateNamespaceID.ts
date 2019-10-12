import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = NemConst.NETWORK_TYPE;
const optParse = new DefaultOptParse();
optParse.subscribe(
  'namespaceName',
  (arg: string) => { return (/^-n\w+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();

const namespaceId = new nem.NamespaceId(option.get(`namespaceName`));

console.log(`NamespaceID : ${namespaceId.toHex()}`);
