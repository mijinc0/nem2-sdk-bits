import * as nem from 'nem2-sdk'
import { NemConst } from './share/NemConst'
import { DefaultOptParse } from './share/DefaultOptParse';

const optParse = new DefaultOptParse();
const option = optParse.parse();
const endpoint = new nem.ChainHttp(option.get('url'));

endpoint.getBlockchainHeight().subscribe(
  x => console.log( x ),
  err => console.log( err ),
)
