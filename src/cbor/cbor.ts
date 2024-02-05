import { DataElement } from "../data-element/data-element";
import { DataElementDeserializer } from "../data-element/data-element-deserializer";
import { DataElementSerializer } from "../data-element/data-element-serializer";
import { CborDataItemConvertible } from "./cbor-data-item-convertible";

/*
export class Cbor {

    public static encode(obj: CborSerializable | DataElement): ArrayBuffer {
        if ((<CborSerializable>obj).writeCbor !== undefined) {
            const cborWriterCloser = new CborWriterCloser();
            const cborWriter = new CborWriter(cborWriterCloser);
            (<CborSerializable>obj).writeCbor(cborWriter);
            cborWriterCloser.close();
            return DataElementSerializer.toCBOR(cborWriterCloser.dataItems[0]);
        }
        if (obj instanceof DataElement) {
            return DataElementSerializer.toCBOR(obj);
        }
        throw new Error("Invalid object");
    }

    public static decode<T extends CborSerializable>(type: Constructable<T>, data: ArrayBuffer): T {
        const dataItem = new type();
        const dataElement = DataElementDeserializer.fromCBOR(data);
        const cborReader = new CborReader([dataElement]);
        dataItem.readCbor(cborReader);
        return dataItem;
    }
}

interface Constructable<T> {
    new (...args: any[]): T;
}
*/

export class Cbor {

    public static encode(obj: CborDataItemConvertible | DataElement): ArrayBuffer {
        if ((<CborDataItemConvertible>obj).toCborDataItem !== undefined) {
            return DataElementSerializer.toCBOR((<CborDataItemConvertible>obj).toCborDataItem());
        }
        if (obj instanceof DataElement) {
            return DataElementSerializer.toCBOR(obj);
        }
        throw new Error("Invalid object");
    }

    public static decode<T extends CborDataItemConvertible>(type: Constructable<T>, data: ArrayBuffer): T {
        const dataItem = DataElementDeserializer.fromCBOR(data);
        const unInitializedIntance = new type();
        const instance = <T>unInitializedIntance.fromCborDataItem(dataItem);
        if (instance === unInitializedIntance) throw new Error("Invalid data item");
        return instance;
    }
}

interface Constructable<T> {
    new (...args: any[]): T;
}