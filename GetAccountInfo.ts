import * as nem from 'nem2-sdk'
import { NemConst } from './share/NemConst'
import { DefaultOptParse } from './share/DefaultOptParse';

const optParse = new DefaultOptParse();
optParse.subscribeAddress();
const option = optParse.parse();
const endpoint = new nem.AccountHttp(option.get('url'));
const address = nem.Address.createFromRawAddress(option.get('address'))
endpoint.getAccountInfo(address).subscribe(
    x => console.log(x),
    err => console.log(err),
);
