import * as nem from 'nem2-sdk';
import { DefaultOptParse } from './share/DefaultOptParse';

const optParse = new DefaultOptParse();
optParse.subscribe(
  'height',
  (arg: string) => { return (/^--height=\d*$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(9) }
);
optParse.subscribe(
  'limit',
  (arg: string) => { return (/^--limit=\d*$/).test(arg) },
  false,
  (arg: string) => { return arg.slice(8) }
);
const option = optParse.parse();
const url = option.get('url');
const height = parseInt(option.get('height'));
const limit = option.get('limit') ? parseInt(option.get('limit')) : 25;
const blockHttp = new nem.BlockHttp(url);
blockHttp
  .getBlocksByHeightWithLimit(height, limit)
  .subscribe(
    (blockInfos) => {
      console.log(`[ fetched block size = ${blockInfos.length} ]`);
      blockInfos.forEach((bi) => {
        console.log(`${bi.height.toString()}  ${bi.hash}`)
      });
    },
    (e) => {
      console.error(e);
    }
);
