export module CliAttr {
  export const Reset = '\u001b[0m';

  export enum Color {
    Non = '',
    Red = '\u001b[31m',
    Green = '\u001b[32m',
  }

  export enum Style {
    Non = '',
    Bold = '\u001b[1m',
  }
}

export class Cli {

  indent: number;
  buffer: string;

  constructor(indent = 2) {
    this.indent = indent;
    this.buffer = '';
  }

  public sets(s: string, indent = false, color = CliAttr.Color.Non, style = CliAttr.Style.Non): void {
    // change attributes
    this.buffer += color + style;
    // add indent
    if (indent) this.buffer += ' '.repeat(this.indent);
    // add string
    this.buffer += s;
    // if needed, reset attributes.
    if (color !== CliAttr.Color.Non || style !== CliAttr.Style.Non) this.buffer += CliAttr.Reset;
  }

  public setHead(head: string): void {
    const out = head + '\n';
    this.sets(out, false, undefined, CliAttr.Style.Bold);
  }

  public setLine(line: string, indent = true, color = CliAttr.Color.Non, style = CliAttr.Style.Non): void {
    const out = line + '\n';
    this.sets(out, indent, color, style);
  }

  public flush(): void {
    // output and delete buffer
    console.log(this.buffer);
    this.buffer = '';
  }

  public error(errMsg: string): void {
    const out = CliAttr.Color.Red + CliAttr.Style.Bold + errMsg + CliAttr.Reset;
    console.error(out);
  }
}
