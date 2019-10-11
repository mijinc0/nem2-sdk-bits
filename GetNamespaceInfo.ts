import * as nem from 'nem2-sdk'
import { NemConst } from './share/NemConst'
import { Cli } from './share/Cli'
import { Util } from './share/Util'
import { TxUtil } from './share/TxUtil'
import { DefaultOptParse } from './share/DefaultOptParse';

function printNamespaceInfo(namespaceInfo: nem.NamespaceInfo): void {
  const cli = new Cli();
  cli.setHead('NamespaceInfo');
  cli.setLine(`active   : ${namespaceInfo.active}`);
  cli.setLine(`index    : ${namespaceInfo.index}`);
  cli.setLine(`depth    : ${namespaceInfo.depth}`);
  cli.setLine(`owner    : ${namespaceInfo.owner.address.plain()}`);
  cli.setLine(`metaID   : ${namespaceInfo.metaId}`);
  cli.setLine(`startHeight : ${Util.hexStrToDecimalStr(namespaceInfo.startHeight.toHex())}`);
  cli.setLine(`endHeight   : ${Util.hexStrToDecimalStr(namespaceInfo.endHeight.toHex())}`);

  const aliasAddress = namespaceInfo.alias.address ? namespaceInfo.alias.address : 'undefined';
  const aliasMosaicID = namespaceInfo.alias.mosaicId ? namespaceInfo.alias.mosaicId : 'undefined';
  cli.setLine(`aliasAddress  : ${aliasAddress}`);
  cli.setLine(`aliasMosaicID : ${aliasMosaicID}`);
  cli.flush();
}

const optParse = new DefaultOptParse();
optParse.subscribe(
  'namespaceName',
  (arg: string) => { return (/^-n\w+$/).test(arg) },
  true,
  (arg: string) => { return arg.slice(2) }
);
const option = optParse.parse();

const namespaceId = new nem.NamespaceId(option.get('namespaceName'));
const namespaceHttp = new nem.NamespaceHttp(option.get('url'));

namespaceHttp.getNamespace(namespaceId).subscribe(
  namespaceInfo => printNamespaceInfo(namespaceInfo),
  err => console.log(err)
);
