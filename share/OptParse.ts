import { Util } from './Util';

interface Finder { (arg: string): boolean }

export class OptParse {

    finders = new Map<string, Finder>();

    // set option name and finder
    public subscribe(key: string, finder: Finder): void {
        this.finders.set(key, finder);
    }

    // parse using subscribed finder
    public parse(): Map<string, string> {
        const opt = new Map<string, string>();
        this.finders.forEach((finder, key) => {
            const val = process.argv.find(finder);
            if (Util.notUndefined(val)) opt.set(key, val);
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

    public subscribe(key: string, finder: Finder): void {
        this.optParse.subscribe(key, finder);
    }

    public parse(): Map<string, string> {
        return this.optParse.parse();
    }
}
