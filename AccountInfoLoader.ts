import { BasicEntityLoader } from '../infla/BasicEntityLoader'
import { ERR_ILLEGAL_ARGUMENT } from '../error/AppError';
import { Util } from '../share/Util'
import { Nem2sdkMod } from '../share/Nem2sdkMod'
import * as nem from 'nem2-sdk';

export class AccountInfoLoader extends BasicEntityLoader<nem.AccountInfo> {
  private accountHttp: nem.AccountHttp;
  private namespaceHttp: nem.NamespaceHttp;

  constructor(accountHttp: nem.AccountHttp, namespaceHttp: nem.NamespaceHttp) {
    super();
    this.accountHttp = accountHttp;
    this.namespaceHttp = namespaceHttp;
  }

  async loadByAlias(alias: string): Promise<nem.AccountInfo[]> {
    return await super.loadEntity(async () => {
      const address = await this.getAddressByAlias(alias);
      return await this.getAccountInfoByAddressObj(address);
    });
  }

  async loadByAddress(address: string, limit?: number): Promise<nem.AccountInfo[]> {
    return await super.loadEntity(async () => {
      if (limit) console.log(`WARN : AccountInfoLoader.loadByAddress ignores the second argument. (limit:${limit})`);
      return await this.getAccountInfoByAddress(address);
    });
  }

  private async getAddressByAlias(alias: string): Promise<nem.Address> {
    const namespaceID = new nem.NamespaceId(alias);
    return await this.namespaceHttp.getLinkedAddress(namespaceID).toPromise();
  }

  private async getAccountInfoByAddress(address: string): Promise<nem.AccountInfo[]> {
    if (!Nem2sdkMod.isAddressFormat(address)) throw ERR_ILLEGAL_ARGUMENT(`this is not address format. getAccountInfoByAddress(${address})`);
    const addressObj = nem.Address.createFromRawAddress(address);
    return await this.getAccountInfoByAddressObj(addressObj);
  }

  private async getAccountInfoByAddressObj(addressObj: nem.Address): Promise<nem.AccountInfo[]> {
    const accountInfo = await this.accountHttp.getAccountInfo(addressObj).toPromise();
    return [accountInfo];
  }
}
