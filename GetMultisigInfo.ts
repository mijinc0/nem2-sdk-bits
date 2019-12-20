import * as nem from 'nem2-sdk'
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { DefaultOptParse } from './share/DefaultOptParse';

const optParse = new DefaultOptParse();
optParse.subscribeAddress();
const option = optParse.parse();

const address = nem.Address.createFromRawAddress(option.get('address'));
const multisigHttp = new nem.MultisigHttp(option.get('url'));

(async () => {
  const multisigAccountInfo = await multisigHttp.getMultisigAccountInfo(address).toPromise();
  console.log(`address    : ${multisigAccountInfo.account.address.plain()}`);
  console.log(`publicKey  : ${multisigAccountInfo.account.publicKey}`);
  console.log(`minApproval: ${multisigAccountInfo.minApproval}`);
  console.log(`minRemoval : ${multisigAccountInfo.minRemoval}`);
  console.log('== cosignatories ==');
  multisigAccountInfo.cosignatories.forEach((cosignatory: nem.PublicAccount, index: number) => {
    console.log(`  ${index + 1}  ${cosignatory.address.plain()}`);
  });
  console.log('== multisigAccounts ==');
  multisigAccountInfo.multisigAccounts.forEach((multisigAccount: nem.PublicAccount, index: number) => {
    console.log(`  ${index + 1}  ${multisigAccount.address.plain()}`);
  });

  const multisigAccountGraphInfo = await multisigHttp.getMultisigAccountGraphInfo(address).toPromise();
  console.log('== multisigAccountGraphInfo ==');
  multisigAccountGraphInfo.multisigAccounts.forEach((multisigAccountInfos: nem.MultisigAccountInfo[], level: number) => {
    console.log(`  # level ${level}`);
    multisigAccountInfos.forEach((multisigAccountInfo: nem.MultisigAccountInfo) => {
      console.log(`    ${multisigAccountInfo.account.address.plain()}`);
    });
  });
})()
