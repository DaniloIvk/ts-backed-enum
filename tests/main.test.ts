import { createBackedEnum, createEnumCase, EnumCase } from '../src';

// =========================================
// 1. Setup Enums & Traits for Testing
// =========================================

// Numeric Enum
enum RoleEnum {
  ADMIN = 1,
  USER = 2,
  GUEST = 3,
}

// String Enum
enum StatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

// Traits
class Comparable extends EnumCase {
  is(other: this) {
    return this.value === other.value;
  }

  isNot(other: this) {
    return !this.is(other);
  }
}

class Stringable extends EnumCase {
  // Overrides default toString (which returns value) to return name
  toString() {
    return this.name;
  }

  slug() {
    return this.name.toLowerCase().replace('_', '-');
  }
}

// Composition
const RoleCase = createEnumCase(Comparable, Stringable);
const Role = createBackedEnum(RoleEnum, RoleCase);

// Default (No Traits)
const Status = createBackedEnum(StatusEnum);

// =========================================
// 2. Test Suites
// =========================================

describe('Backed Enum Library', () => {
  describe('Scenario 1: Custom Traits (Role Enum)', () => {
    it('Should correctly map enum keys to instances', () => {
      expect(Role.ADMIN).toBeInstanceOf(EnumCase);
      expect(Role.ADMIN.name).toBe('ADMIN');
      expect(Role.ADMIN.value).toBe(1);
    });

    it('Should contain trait methods (Comparable)', () => {
      // "is" exists
      expect(Role.ADMIN.is(Role.ADMIN)).toBe(true);
      expect(Role.ADMIN.is(Role.USER)).toBe(false);

      // "isNot" exists
      expect(Role.ADMIN.isNot(Role.USER)).toBe(true);
    });

    it('Should contain trait methods (Stringable)', () => {
      // "slug" exists
      expect(Role.GUEST.slug()).toBe('guest');

      // "toString" is overridden
      expect(String(Role.USER)).toBe('USER');
      expect(Role.USER.toString()).toBe('USER');
    });

    it('Should list all primitive values via values()', () => {
      // Should be [1, 2, 3]
      expect(Role.values()).toEqual(expect.arrayContaining([1, 2, 3]));
      expect(Role.values()).toHaveLength(3);
    });

    it('Should list all case instances via cases array', () => {
      expect(Role.cases).toHaveLength(3);
      expect(Role.cases[0]).toHaveProperty('name', 'ADMIN');
      // Ensure they are the exact same objects as the properties
      expect(Role.cases[0]).toBe(Role.ADMIN);
    });
  });

  describe('Scenario 2: Default Behavior (Status Enum)', () => {
    it('Should work without a custom Case Class', () => {
      expect(Status.ACTIVE).toBeInstanceOf(EnumCase);
      expect(Status.ACTIVE.name).toBe('ACTIVE');
      expect(Status.ACTIVE.value).toBe('active');
    });

    it('Should use default toString() implementation (returns value)', () => {
      // Default EnumCase.toString() returns the value cast to string
      expect(String(Status.PENDING)).toBe('pending');
    });

    it('Should correctly handle string-based enums', () => {
      expect(Status.values()).toEqual(
        expect.arrayContaining(['pending', 'active', 'archived'])
      );
    });
  });

  describe('Scenario 3: The from() method', () => {
    // --- Positive Cases ---

    it('Should find an instance from a primitive value (Number)', () => {
      const found = Role.from(2);
      expect(found).toBeDefined();
      expect(found).toBe(Role.USER);
    });

    it('Should find an instance from a primitive value (String)', () => {
      const found = Status.from('archived');
      expect(found).toBeDefined();
      expect(found).toBe(Status.ARCHIVED);
    });

    it('Should handle recursive instance lookups (Idempotency)', () => {
      // If I pass the instance itself, it should return the instance
      const found = Role.from(Role.ADMIN);
      expect(found).toBe(Role.ADMIN);
    });

    // --- Negative Cases ---

    it('Should return undefined for primitive values that do not exist', () => {
      expect(Role.from(999)).toBeUndefined();
      expect(Status.from('does_not_exist')).toBeUndefined();
    });

    it('Should return undefined for invalid types (null/undefined/objects)', () => {
      expect(Role.from(null)).toBeUndefined();
      expect(Role.from(undefined)).toBeUndefined();
      expect(Role.from({})).toBeUndefined();
    });

    it('Should be case-sensitive for string lookups', () => {
      // "ACTIVE" key vs "active" value.
      // If enum value is "active", passing "ACTIVE" should likely fail unless your logic handles it.
      // Standard Map lookup is strict.
      expect(Status.from('ACTIVE')).toBeUndefined();
    });
  });

  describe('Scenario 4: Type Safety & Iteration', () => {
    it('Should be iterable via Object.keys or Object.values', () => {
      // The BackedEnum creates properties on the instance
      // We want to ensure we can iterate over them if needed,
      // or at least that they are enumerable properties.
      const keys = Object.keys(Role);
      // keys usually includes 'cases' and 'map' if they are public,
      // but the specific enum keys (ADMIN, USER) should be there.
      expect(keys).toContain('ADMIN');
      expect(keys).toContain('USER');
    });

    it('Should maintain strict equality of instances', () => {
      // Accessing property twice yields exact same object reference
      expect(Role.ADMIN).toBe(Role.ADMIN);
      // Accessing via from() yields exact same object reference
      expect(Role.from(1)).toBe(Role.ADMIN);
      // Accessing via cases array yields exact same object reference
      expect(Role.cases.find((c) => c.value === 1)).toBe(Role.ADMIN);
    });
  });
});
