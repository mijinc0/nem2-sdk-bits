import { Util } from './Util';
import { OptParse } from './OptParse'

interface Finder { (arg: string): boolean }
interface Processor { (arg: string): string }

const DEFAULT_PROCESSOR = (arg: string) => { return arg };

export class DefaultOptParse {

    optParse = new OptParse();

    constructor() {
        const urlFinder = (arg: string) => { return (/^(http|https):\/\//).test(arg) || (/^\d+\.\d+\.\d+\.\d+(:\d+)*$/).test(arg) };
        this.subscribe('url', urlFinder, undefined, undefined, 'http://localhost:3000');
    }

    subscribe(key: string, finder: Finder, required = false, processor = DEFAULT_PROCESSOR, defaultValue?: string): void {
        this.optParse.subscribe(key, finder, required, processor, defaultValue);
    }

    subscribeAddress(required = true): void {
        const addressFinder = (arg: string) => { return Util.isAddressFormat(arg) };
        this.subscribe('address', addressFinder, required);
    }

    subscribePrivateKey(required = true): void {
        const privateKeyFinder = (arg: string) => { return Util.isKeyFormat(arg) };
        this.subscribe('privateKey', privateKeyFinder, required);
    }

    parse(): Map<string, string> {
        return this.optParse.parse();
    }
}
