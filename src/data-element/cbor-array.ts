import { CborDataItem } from "./cbor-data-item";

export class CborArray extends CborDataItem implements Iterable<CborDataItem> {

    constructor(private value: CborDataItem[] = []) {
        super(new CborDataItem.Attribute(CborDataItem.Type.list));
        return new Proxy(this, {
            get: (target, propKey, receiver) => {
              if (typeof propKey === "string" && this.isSafeArrayIndex(propKey)) {
                return Reflect.get(this.value, propKey);
              }
              return Reflect.get(target, propKey, receiver);
            },
            set: (target, propKey, value, receiver) => {
              if (typeof propKey === "string" && this.isSafeArrayIndex(propKey)) {
                return Reflect.set(this.value, propKey, value);
              }
              //return Reflect.set(target, propKey, value, receiver);
              throw new Error("Invalid index");
            },
        });
    }

    
    get [Symbol.toStringTag]() {
        return "ObjectHandler";
    }

 //   [index: number]: CborDataItem2 

    *[Symbol.iterator](): Iterator<CborDataItem, any, undefined> {
        for(let i of this.value) {
            yield i;
        }
    }

    get<T extends CborDataItem>(index: number): T {
        return this.value[index] as T;
    }

    add(value: CborDataItem): void {
        this.value.push(value);
    }

    public getValue(): CborDataItem[] {
        return this.value;
    }

    get length(): number {
        return this.value.length;
    }

    private values(): CborDataItem[] {
        const values:CborDataItem[] = [];
        for (const i of Object.keys(this).map(Number)) if (!isNaN(i)) values.push(this[i]);
        return values;
    }
 
    private isSafeArrayIndex(propKey: string): boolean {
        const uint = Number.parseInt(propKey, 10);
        const s = uint + "";
        return propKey === s && uint !== 0xffffffff && uint < this.value.length;
    }
}
