import { CborDataItem } from "./cbor-data-item";

export class CborArrayCopy extends CborDataItem implements Iterable<CborDataItem> {

    readonly length: number = 0;

    #mutableThis = this as Mutable<CborArrayCopy>;

    constructor(private value: CborDataItem[] = []) {
        super(new CborDataItem.Attribute(CborDataItem.Type.list));
    }

    [index: number]: CborDataItem 

    *[Symbol.iterator](): Iterator<CborDataItem, any, undefined> {
        for(let i of this.values()) {
            yield i;
        }
    }

    get<T extends CborDataItem>(index: number): T {
        return this[index] as T;
    }

    add(value: CborDataItem): void {
        this[this.length] = value;
        this.changeLength(this.length + 1);
    }

    public getValue(): CborDataItem[] {
        return this.values();
    }

    private changeLength(length: number) {
        this.#mutableThis.length = length;
    }

    private values(): CborDataItem[] {
        const values:CborDataItem[] = [];
        for (const i of Object.keys(this).map(Number)) if (!isNaN(i)) values.push(this[i]);
        return values;
    }
    
}

type Mutable<T> = {
    -readonly [k in keyof T]: T[k];
 };
