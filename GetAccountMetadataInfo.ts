import * as nem from 'nem2-sdk';
import { NemConst } from './share/NemConst'
import { Util } from './share/Util'
import { DefaultOptParse } from './share/DefaultOptParse';

const netType = nem.NetworkType.MIJIN_TEST;
const optParse = new DefaultOptParse();
optParse.subscribeAddress();
const option = optParse.parse();

const printInfo = (meta: nem.Metadata[]) => {
  console.log(`== MetadataInfomation of ${option.get('address')} ==`);
  if(meta.length === 0) console.log(`empty`);
  meta.forEach(m => {
    console.log(`ID : ${m.id}`);
    const entry = m.metadataEntry;
    console.table({
      compositeHash: entry.compositeHash,
      metadataType: `${(<any>nem.MetadataType)[entry.metadataType]}`,
      scopedMetadataKey: entry.scopedMetadataKey.toHex(),
      senderPublicKey: entry.senderPublicKey,
      targetId: entry.targetId ? entry.targetId.toHex() : 'undefined',
      targetPublicKey: entry.targetPublicKey,
      value: entry.value,
      valueSize: entry.valueSize.toString(),
    });
  });
};

const address = nem.Address.createFromRawAddress(option.get('address'));
const metadataHttp = new nem.MetadataHttp(option.get('url'));
metadataHttp.getAccountMetadata(address).subscribe(
  x => printInfo(x),
  e => console.error(e.message)
);
