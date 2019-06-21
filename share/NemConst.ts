import * as nem from 'nem2-sdk';

export namespace NemConst{
    export const URL = 'http://localhost:3000';

    export const NETWORK_TYPE = nem.NetworkType.MIJIN_TEST;

    export const CURRENCY_MOSAIC_ID = '6EEC7FB674DD1DDB';

    export const CURRENCY_MOSAIC_ID_OBJ = new nem.MosaicId(CURRENCY_MOSAIC_ID);
}
