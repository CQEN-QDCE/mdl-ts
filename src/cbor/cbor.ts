import { CborDataItem } from "../data-element/cbor-data-item";
import { CborDecoder } from "./cbor-decoder";
import { CborEncoder } from "./cbor-encoder";
import { CborConvertible } from "./cbor-convertible";

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

    public static encode(obj: CborConvertible | CborDataItem): ArrayBuffer {
        if ((<CborConvertible>obj).toCborDataItem !== undefined) {
            return CborEncoder.encode((<CborConvertible>obj).toCborDataItem());
        }
        if (obj instanceof CborDataItem) {
            return CborEncoder.encode(obj);
        }
        throw new Error("Invalid object");
    }

    public static decode<T extends CborConvertible>(type: Constructable<T>, data: ArrayBuffer): T {
        const dataItem = CborDecoder.decode(data);
        const unInitializedIntance = new type();
        const instance = <T>unInitializedIntance.fromCborDataItem(dataItem);
        if (instance === unInitializedIntance) throw new Error("Invalid data item");
        return instance;
    }
}

interface Constructable<T> {
    new (...args: any[]): T;
}