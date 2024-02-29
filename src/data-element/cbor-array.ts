import { CborDataItem } from "../cbor/cbor-data-item";
import { CborBoolean } from "../cbor/types/cbor-boolean";
import { CborByteString } from "../cbor/types/cbor-byte-string";
import { CborEncodedDataItem } from "../cbor/types/cbor-encoded-data-item";
import { CborNil } from "../cbor/types/cbor-nil";
import { CborNumber } from "../cbor/types/cbor-number";
import { CborMap } from "./cbor-map";

/*
export class CborArray extends Array<CborArray | CborNumber | CborBoolean | CborNil | CborByteString | CborByteString | CborEncodedDataItem | MapElement> implements CborDataItem {
    majorType: number;
    constructor(...value: (CborArray | CborNumber | CborBoolean | CborNil | CborByteString | CborByteString | CborEncodedDataItem | MapElement)[]) {
        super();
        this.push(...value);
        this.majorType = 0;
    }

    get type(): CborDataItem.Type {
        return new CborDataItem.Attribute(CborDataItem.Type.list).type;
    }

    public getValue(): CborDataItem[] {
        return this;
    }
}
*/
export class CborArray extends Array<CborDataItem> implements CborDataItem {
    majorType: number;
    constructor(...value: (CborArray | CborNumber | CborBoolean | CborNil | CborByteString | CborByteString | CborEncodedDataItem | CborMap)[]) {
        super();
        this.push(...value);
        this.majorType = 0;
    }

    get type(): CborDataItem.Type {
        return new CborDataItem.Attribute(CborDataItem.Type.list).type;
    }

    public getValue(): CborDataItem[] {
        return this;
    }
}