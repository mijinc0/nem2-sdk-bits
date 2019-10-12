import * as nem from 'nem2-sdk';
import { Cli } from './share/Cli'
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const optParse = new DefaultOptParse();
optParse.subscribeAddress();
const option = optParse.parse();

const printInfo = (info: nem.AccountRestriction) => {
  const cli = new Cli();
  cli.setHead(`${<any>nem.AccountRestrictionType[info.restrictionType]}`);
  info.values.forEach(x => {
    cli.setLine(JSON.stringify(x));
  });
  cli.flush();
};

const address = nem.Address.createFromRawAddress(option.get('address'));
const restrictionHttp = new nem.RestrictionHttp(option.get('url'));
restrictionHttp.getAccountRestrictions(address).subscribe(
  x => x.forEach(y => { printInfo(y) }),
  e => console.error(e.message)
);
