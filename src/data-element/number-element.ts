import { CborDataItem2 } from "./cbor-data-item2";

export class NumberElement extends CborDataItem2<number> {

    constructor(value: number) {
        super(value, new CborDataItem2.Attribute(CborDataItem2.Type.number));
    }
    
}