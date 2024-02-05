import { DataElement } from "../data-element/data-element";
import { CborDataItemConvertible } from "./cbor-data-item-convertible";

export class CborDataItem {
    
    public static from(object: CborDataItemConvertible): DataElement {
        return (<CborDataItemConvertible>object).toCborDataItem();
    }
    
    public static to<T extends CborDataItemConvertible>(type: Constructable<T>, dataItem: DataElement): T {
        const unInitializedIntance = new type();
        const instance = <T>unInitializedIntance.fromCborDataItem(dataItem);
        if (instance === unInitializedIntance) throw new Error("Invalid data item");
        return instance;
    }
    
}

interface Constructable<T> {
    new (...args: any[]): T;
}