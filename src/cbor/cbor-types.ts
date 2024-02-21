/*
declare const cborNumber: unique symbol;

declare const cborBoolean: unique symbol;

declare const cborTextString: unique symbol;

declare const cborByteString: unique symbol;

declare const cborEncodedDataItem: unique symbol;

declare const cborNil: unique symbol;

interface CborDataItem { readonly majorType: number | undefined; }

export type CborNumber = number & { readonly [cborNumber]: 'CborNumber'; majorType: undefined } & CborDataItem;

export type CborBoolean = boolean & { readonly [cborBoolean]: 'CborBoolean'; majorType: 7 } & CborDataItem;

export type CborNil = { readonly [cborNil]: 'CborNil'; majorType: 7} & CborDataItem;

export type CborTextString = string & { readonly [cborTextString]: 'CborTextString'; majorType: 3 } & CborDataItem;

export type CborByteString = ArrayBuffer & { readonly [cborByteString]: 'CborByteString'; majorType: 2 } & CborDataItem;

export type CborEncodedDataItem = ArrayBuffer & { readonly [cborEncodedDataItem]: 'CborEncodedDataItem'; majorType: undefined } & CborDataItem;

export class CborArray extends Array<CborDataItem> implements CborDataItem {
    readonly majorType: 4;
}



export class CborMap extends Map<number | string, CborDataItem> implements CborDataItem {
    readonly majorType: 5;
}
*/
export enum Type {
    number,     // #0, #1, #7.25, #7.26, #7.27
    boolean,    // #7.20, #7.21
    textString, // #3
    byteString, // #2
    nil,        // #7.22
    dateTime,   // #6.0, #6.1
    fullDate,   // #6.1004, #6.100
    list,       // #4
    map,        // #5,
    encodedCbor // #6.24
}

export abstract class CborDataItem<T = void> { 
    public readonly majorType: number | undefined; 
    public readonly value: T;
    protected constructor(majorType: number, value: T) {
        this.majorType = majorType;
        this.value = value;
    }
}

export class CborArray implements CborDataItem<CborDataItem[]> {
    value: CborDataItem[];
    readonly majorType: 4;
}

export class CborNil extends CborDataItem<null> {
    constructor() {
        super(7, null);
    }
}

export class CborTextString extends CborDataItem<string> {
    constructor(value: string) {
        super(3, value);
    }
}

export class CborByteString extends CborDataItem<ArrayBuffer> {
    constructor(value: ArrayBuffer) {
        super(2, value);
    }
}

export class CborEncodedDataItem extends CborDataItem<ArrayBuffer> {
    constructor(value: ArrayBuffer) {
        super(undefined, value);
    }
}

export class CborBoolean extends CborDataItem<boolean> {
    constructor(value: boolean) {
        super(7, value);
    }
}

export class CborNumber extends CborDataItem<number> {
    constructor(value: number) {
        super(value >= 0 ? 0 : 1, value);
    }
}


//export class CborMap extends Map<number | string, CborDataItem> implements CborDataItem {
//    constructor() { }
//    get majorType(): number { return 5; }
//}
