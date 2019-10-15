import * as nem from 'nem2-sdk';
import { Cli, CliAttr } from './share/Cli'
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const optParse = new DefaultOptParse();
optParse.subscribe(
  'mosaicID',
  (arg: string) => { return (/^[0-9A-Fa-f]{16}$/).test(arg) },
  true,
);
optParse.subscribe(
  'addresses',
  (arg: string) => { return (/^[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]{40}(:[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]{40})*$/).test(arg) },
  false,
);
const option = optParse.parse();

const rawMosaicID = option.get('mosaicID') ? option.get('mosaicID') : undefined;
const mosaicID = rawMosaicID ? new nem.MosaicId(rawMosaicID) : undefined;
const rawAddresses = option.get('addresses') ? option.get('addresses').split(':') : undefined;
const addresses = rawAddresses ? rawAddresses.map(rawAddress => nem.Address.createFromRawAddress(rawAddress)) : undefined;

const cli = new Cli();
const restrictionHttp = new nem.RestrictionHttp(option.get('url'));

const setGlobalInfosIntoCli = async () => {
  let globalRestriction: nem.MosaicGlobalRestriction;
  try {
    globalRestriction = await restrictionHttp.getMosaicGlobalRestriction(mosaicID).toPromise();
  } catch (e) {
    console.error(e.message);
    return;
  }
  cli.setHead('MosaicGlobalRestrictionInfo');
  cli.setLine(globalRestriction.mosaicId.toHex(), true, CliAttr.Color.Green);
  cli.setLine(`compositeHash : ${globalRestriction.compositeHash}`);
  cli.setLine('== restrictions ==');
  globalRestriction.restrictions.forEach((val: nem.MosaicGlobalRestrictionItem, key: string) => {
    const referMosaicID = val.referenceMosaicId.toHex();
    const type = `${<any>nem.MosaicRestrictionType[val.restrictionType]}`;
    const value = val.restrictionValue;
    cli.setLine(`${key}:{ referenceMoaicID:${referMosaicID}, restrictionType:${type}, restrictionValue:${value} }`);
  });
};

const setAddressRestrictionIntoCli = async () => {
  let addressRestrictions: nem.MosaicAddressRestriction[];
  try {
    addressRestrictions = await restrictionHttp.getMosaicAddressRestrictions(mosaicID, addresses).toPromise();
  } catch (e) {
    console.error(e.message);
    return;
  }
  // print restrictions
  cli.setHead('MosaicAddressRestrictionsInfo');
  addressRestrictions.forEach(addressRestriction => {
    cli.setLine(`${addressRestriction.targetAddress.plain()}`, true, CliAttr.Color.Green);
    cli.setLine(`compositeHash : ${addressRestriction.compositeHash}`);
    cli.setLine(`     mosaicID : ${addressRestriction.mosaicId.toHex()}`);
    cli.setLine('== restrictions ==');
    addressRestriction.restrictions.forEach((val: string, key: string) => {
      cli.setLine(`{ ${key}:${val} }`);
    });
  });
  // print not found
  const found = addressRestrictions.map(addressRestriction => addressRestriction.targetAddress.plain());
  const notFound = rawAddresses.filter((rawAddress: string) => !found.includes(rawAddress));
  notFound.forEach((address: string) => cli.setLine(`NOT_FOUND:${address}`, true, CliAttr.Color.Yellow));
};

const start = async () => {
  await setGlobalInfosIntoCli();
  if (addresses) await setAddressRestrictionIntoCli();
  cli.flush();
};

start();
