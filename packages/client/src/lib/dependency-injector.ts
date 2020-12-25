type Class<T> = new (...args: any[]) => T;

type Classes<Tuple extends [...any[]]> = Tuple extends any[]
  ? {
      [Index in keyof Tuple]: Class<Tuple[Index]>;
    }
  : [];

export class DependencyInjector {
  depMap = new Map<Class<any>, Class<any>[]>();
  instanceMap = new Map<Class<any>, any>();

  registerClass<K extends Class<any>>(klass: K, deps: Classes<ConstructorParameters<K>>) {
    this.depMap.set(klass, deps);
  }

  getSingleton<T>(klass: { new (...args: any[]): T }): T {
    const existingInstance = this.instanceMap.get(klass);
    if (existingInstance) return existingInstance;

    return this.createShallow(klass);
  }

  createShallow<T>(klass: { new (...args: any[]): T }): T {
    const depKlasses = this.depMap.get(klass)!;
    const depInstances = depKlasses.map((depKlass) => this.getSingleton(depKlass));

    const newInstance = new klass(...depInstances);
    this.instanceMap.set(klass, newInstance);

    return newInstance;
  }
}

export const di = new DependencyInjector();
