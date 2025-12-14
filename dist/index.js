import withTraits from '@daniloivk/ts-traits';
export class EnumCase {
    name;
    value;
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
    toString() {
        return String(this.value);
    }
}
export function createEnumCase(...traits) {
    return withTraits(EnumCase, ...traits);
}
export function createBackedEnum(baseEnum, CaseClass = EnumCase) {
    const keys = Object.keys(baseEnum).filter((key) => isNaN(Number(key)));
    class BackedEnum {
        cases = [];
        map = new Map();
        constructor() {
            for (const key of keys) {
                const value = baseEnum[key];
                const instance = new CaseClass(key, value);
                this.cases.push(instance);
                this.map.set(value, instance);
                Object.defineProperty(this, key, {
                    value: instance,
                    enumerable: true,
                });
            }
        }
        from(value) {
            return this.map.get(value);
        }
        values() {
            return this.cases.map((_case) => _case.value);
        }
    }
    return new BackedEnum();
}
