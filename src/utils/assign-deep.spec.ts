import {expect} from 'chai';
import {assignDeep} from './assign-deep.js';

describe('assignDeep', function () {
  it('should merge properties from a single source object into a target object', function () {
    const target = {a: 1, b: 2};
    const source = {b: 3, c: 4};
    const expected = {a: 1, b: 3, c: 4};
    assignDeep(target, source);
    expect(target).to.deep.equal(expected);
  });

  it('should merge properties from multiple source objects', function () {
    const target = {a: 1};
    const source1 = {b: 2};
    const source2 = {c: 3};
    const expected = {a: 1, b: 2, c: 3};
    assignDeep(target, source1, source2);
    expect(target).to.deep.equal(expected);
  });

  it('should overwrite properties from earlier sources with properties from later sources', function () {
    const target = {a: 1, b: 2};
    const source1 = {b: 3, c: 4};
    const source2 = {c: 5, d: 6};
    const expected = {a: 1, b: 3, c: 5, d: 6};
    assignDeep(target, source1, source2);
    expect(target).to.deep.equal(expected);
  });

  it('should modify the target object directly (be mutable)', function () {
    const target = {a: 1};
    const source = {b: 2};
    const result = assignDeep(target, source);
    expect(result).to.equal(target);
    expect(target).to.deep.equal({a: 1, b: 2});
  });

  it('should not modify the source objects', function () {
    const target = {a: 1};
    const source = {b: {c: 3}};
    const sourceBefore = structuredClone(source);
    assignDeep(target, source);
    expect(source).to.deep.equal(sourceBefore);
  });

  describe('deep merge', function () {
    it('should recursively merge nested objects', function () {
      const target = {
        a: 1,
        nested: {
          x: 10,
          y: 11,
        },
      };
      const source = {
        b: 2,
        nested: {
          y: 12,
          z: 13,
        },
      };
      const expected = {
        a: 1,
        b: 2,
        nested: {
          x: 10,
          y: 12,
          z: 13,
        },
      };
      assignDeep(target, source);
      expect(target).to.deep.equal(expected);
    });

    it('should add a nested object to the target if it does not exist', function () {
      const target = {a: 1};
      const source = {nested: {x: 10}};
      const expected = {a: 1, nested: {x: 10}};
      assignDeep(target, source);
      expect(target).to.deep.equal(expected);
    });

    it('should handle deeply nested structures correctly', function () {
      const target = {
        level1: {
          level2: {
            val1: 'A',
          },
        },
      };
      const source = {
        level1: {
          level2: {
            val2: 'B',
          },
          newLevel2: {
            val3: 'C',
          },
        },
      };
      const expected = {
        level1: {
          level2: {
            val1: 'A',
            val2: 'B',
          },
          newLevel2: {
            val3: 'C',
          },
        },
      };
      assignDeep(target, source);
      expect(target).to.deep.equal(expected);
    });
  });

  describe('edge cases', function () {
    it('should overwrite arrays, not merge them', function () {
      const target = {data: [1, 2]};
      const source = {data: [3, 4, 5]};
      const expected = {data: [3, 4, 5]};
      assignDeep(target, source);
      expect(target).to.deep.equal(expected);
      expect(target.data).to.be.an('array');
    });

    it('should overwrite a non-object value with an object', function () {
      const target = {a: 1};
      const source = {a: {b: 2}};
      const expected = {a: {b: 2}};
      assignDeep(target, source);
      expect(target).to.deep.equal(expected);
    });

    it('should overwrite an object with a non-object value (e.g., null)', function () {
      const target = {nested: {x: 10}};
      const source = {nested: null};
      const expected = {nested: null};
      assignDeep(target, source);
      expect(target).to.deep.equal(expected);
    });

    it('should handle empty source objects gracefully', function () {
      const target = {a: 1};
      const expected = {a: 1};
      assignDeep(target, {});
      expect(target).to.deep.equal(expected);
    });

    it('should work correctly when the target is an empty object', function () {
      const target = {};
      const source = {a: 1, b: {c: 2}};
      const expected = {a: 1, b: {c: 2}};
      assignDeep(target, source);
      expect(target).to.deep.equal(expected);
    });

    it('should ignore null and undefined sources', function () {
      const target = {a: 1};
      const source1 = {b: 2};
      const source2 = null as unknown as object;
      const source3 = {c: 3};
      const source4 = undefined as unknown as object;
      const expected = {a: 1, b: 2, c: 3};
      assignDeep(target, source1, source2, source3, source4);
      expect(target).to.deep.equal(expected);
    });

    it('should handle source properties with undefined values', function () {
      const target = {a: 1};
      const source = {b: undefined, a: 'overwritten'};
      const expected = {a: 'overwritten', b: undefined};
      assignDeep(target, source);
      expect(target).to.deep.equal(expected);
      expect('b' in target).to.be.true;
    });

    it('should correctly merge properties with symbol keys', function () {
      const symKey1 = Symbol('key1');
      const symKey2 = Symbol('key2');
      const target = {[symKey1]: 'value1'} as Record<symbol, unknown>;
      const source = {[symKey2]: 'value2', [symKey1]: 'overwritten'};
      assignDeep(target, source);
      expect(target[symKey1]).to.equal('overwritten');
      expect(target[symKey2]).to.equal('value2');
    });

    it('should correctly merge nested objects with symbol keys', function () {
      const symKey = Symbol('nested');
      const target = {[symKey]: {a: 1}};
      const source = {[symKey]: {b: 2}};
      const expected = {[symKey]: {a: 1, b: 2}};
      assignDeep(target, source);
      // chai's deep.equal не всегда хорошо работает с символами
      // в сложных случаях, поэтому проверяем вручную для надежности
      expect(target[symKey]).to.deep.equal(expected[symKey]);
    });
  });
});
