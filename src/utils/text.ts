export class Text {

    static decode(buffer: ArrayBuffer): string {
        return String.fromCharCode.apply(null, new Uint16Array(buffer));
    }

    static encode(value: string): ArrayBuffer {
        const buf = new ArrayBuffer(value.length * 2); // 2 bytes for each char
        const bufView = new Uint16Array(buf);
        for (var i = 0, strLen = value.length; i < strLen; i++) {
          bufView[i] = value.charCodeAt(i);
        }
        return buf;
    }
}