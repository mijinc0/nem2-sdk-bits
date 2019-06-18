import { Util } from './Util';

interface Finder { (arg: string): boolean }
interface Processor { (arg: string): string }

class OptionProperty {
    key: string;
    finder: Finder;
    processor: Processor;

    constructor(key: string, finder: Finder, processor: Processor) {
        this.key = key;
        this.finder = finder;
        this.processor = processor;
    }
}

export class OptParse {
    static DEFAULT_PROCESSOR = (arg: string) => { return arg };

    private properties = new Array<OptionProperty>();

    // set option name and finder
    subscribe(key: string, finder: Finder, processor = OptParse.DEFAULT_PROCESSOR): void {
        this.properties.push(new OptionProperty(key, finder, processor));
    }

    // parse using subscribed finder
    parse(): Map<string, string> {
        const opt = new Map<string, string>();
        this.properties.forEach(property => {
            const arg = process.argv.find(property.finder);
            if (Util.notUndefined(arg)) opt.set(property.key, property.processor(arg));
        });
        return opt;
    }
}

export class DefaultOptParse {

    optParse = new OptParse();

    constructor() {
        const addressFinder = (arg: string) => { return Util.isAddressFormat(arg) };
        this.optParse.subscribe('address', addressFinder);

        const privateKeyFinder = (arg: string) => { return Util.isKeyFormat(arg) };
        this.optParse.subscribe('privateKey', privateKeyFinder);
    }

    subscribe(key: string, finder: Finder, processor = OptParse.DEFAULT_PROCESSOR): void {
        this.optParse.subscribe(key, finder, processor);
    }

    parse(): Map<string, string> {
        return this.optParse.parse();
    }
}
