interface IObject {
    id: number;
    test(): void;
  }
  interface IObjectClass<T> {
    new(): T;
    table_name: string;
    test(): void;
  }
  function createObject<T extends IObject>(cls: IObjectClass<T>, data:Partial<T>):T {
    let obj:T = (<any>Object).assign({},
      data,
      {
        id: 1,
        table_name: cls.table_name,
      }
    )
    return obj;
  }
  
  //------------------------
  // Implementation
  //------------------------
  export class User implements IObject {
    test(): void {
        throw new Error("Method not implemented.");
    }
    static table_name: string = 'user';
    id: number;
    name: string;
    //static test(): void {}
  }

  //------------------------
// Application
//------------------------
//let user = createObject(User, {name: 'Jimmy'});
//console.log(user.name);


export function getInstance<T extends Object>(type: (new (...args: any[]) => T), ...args: any[]): T {
    return new type(...args);
}

export class Foo {
    private constructor() {
    }
    bar() {
      console.log("Hello World")
    }
  }


  export interface SerializableStatic {
    new (...args: any[]): any
    fromObject(data: Record<string, unknown>): InstanceType<this>
  }
  
  export interface Serializable {
    id: string
    toJSON(): string
  }

  class Person implements Serializable {
      id: string;
      toJSON(): string {
          throw new Error("Method not implemented.");
      }
    // ...
  }

  class Dese {
//    createObject<T extends IObject>(cls: IObjectClass<T>, data:Partial<T>):T {
 //   }
    //createObject2<S extends SerializableStatic, I extends Serializable = InstanceType<S>>(cls: IObjectClass<T>, data:Partial<T>):T {
    //}
  }

  class Database<S extends SerializableStatic, I extends Serializable = InstanceType<S>> {
    #dbPath: string
    #data: Map<string, I> = new Map()
    #entity: S
  
    constructor(entity: S) {
      //this.#dbPath = resolve(dirname(import.meta.url), `.data/${entity.name.toLowerCase()}.json`)
      this.#entity = entity
      this.#initialize()
    }
  
    #initialize() {
      //if (existsSync(this.#dbPath)) {
        const data: [string, Record<string, unknown>][] = null
        for (const [key, value] of data) {
          this.#data.set(key, this.#entity.fromObject(value))
        }
        return
//}
      //this.#updateFile()
    }
  }

  //const db = new Database(Person)