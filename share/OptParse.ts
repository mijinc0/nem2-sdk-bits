import { Util } from './Util';

interface Finder { (arg: string): boolean }
interface Processor { (arg: string): string }

class OptionProperty {
  key: string;
  finder: Finder;
  required: boolean;
  processor: Processor;
  defaultValue: string;

  constructor(key: string, finder: Finder, required: boolean, processor: Processor, defaultValue?: string) {
    this.key = key;
    this.finder = finder;
    this.required = required;
    this.processor = processor;
    this.defaultValue = defaultValue;
  }
}

export class OptParse {
  private properties = new Array<OptionProperty>();

  // set option name and finder
  subscribe(key: string, finder: Finder, required: boolean, processor: Processor, defaultValue?: string): void {
    this.properties.push(new OptionProperty(key, finder, required, processor, defaultValue));
  }

  // parse using subscribed finder
  parse(): Map<string, string> {
    const opt = new Map<string, string>();

    // at first, set default values
    this.properties.forEach(property => {
      if (property.defaultValue) opt.set(property.key, property.defaultValue);
    });

    this.properties.forEach(property => {
      const arg = process.argv.find(property.finder);
      // found
      if (Util.notUndefined(arg)) {
        opt.set(property.key, property.processor(arg));
        return;
      }
      // not found and required
      if (property.required) {
        console.error(`property of ${property.key} is required option.`);
        process.exit(1);
      }
    });
    return opt;
  }
}
