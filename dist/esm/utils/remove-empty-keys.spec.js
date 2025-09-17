import { expect } from 'chai';
import { removeEmptyKeys } from './remove-empty-keys.js';
describe('removeEmptyKeys', function () {
    describe('with default behavior (removes null and undefined)', function () {
        it('should remove keys with null values', function () {
            const input = { a: 1, b: null, c: 'hello' };
            const result = removeEmptyKeys(input);
            expect(result).to.deep.equal({ a: 1, c: 'hello' });
        });
        it('should remove keys with undefined values', function () {
            const input = { a: 1, b: undefined, c: 0 };
            const result = removeEmptyKeys(input);
            expect(result).to.deep.equal({ a: 1, c: 0 });
        });
        it('should remove both null and undefined keys from the same object', function () {
            const input = {
                name: 'Alice',
                age: undefined,
                city: 'New York',
                country: null,
            };
            const result = removeEmptyKeys(input);
            expect(result).to.deep.equal({ name: 'Alice', city: 'New York' });
        });
        it('should NOT remove keys with other falsy values like 0, false, or empty strings', function () {
            const input = { a: 0, b: false, c: '', d: null };
            const result = removeEmptyKeys(input);
            expect(result).to.deep.equal({ a: 0, b: false, c: '' });
        });
        it('should return an identical new object if no keys are empty', function () {
            const input = { a: 1, b: 'two', c: true };
            const result = removeEmptyKeys(input);
            expect(result).to.deep.equal({ a: 1, b: 'two', c: true });
        });
        it('should return an empty object if the input is an empty object', function () {
            const input = {};
            const result = removeEmptyKeys(input);
            expect(result).to.deep.equal({});
        });
    });
    describe('with a custom `removeWhen` predicate', function () {
        it('should remove all falsy values when specified', function () {
            const input = {
                a: 1,
                b: 0,
                c: 'hello',
                d: '',
                e: true,
                f: false,
                g: null,
                h: undefined,
            };
            const removeFalsy = (value) => !value;
            const result = removeEmptyKeys(input, removeFalsy);
            expect(result).to.deep.equal({ a: 1, c: 'hello', e: true });
        });
        it('should remove only empty strings when specified', function () {
            const input = { name: 'Bob', bio: '', age: 0, notes: null };
            const removeEmptyString = (value) => value === '';
            const result = removeEmptyKeys(input, removeEmptyString);
            expect(result).to.deep.equal({ name: 'Bob', age: 0, notes: null });
        });
        it('should remove empty arrays when specified', function () {
            const input = {
                tasks: [],
                user: { name: 'Charlie' },
                tags: ['a', 'b'],
                projects: [],
            };
            const removeEmptyArray = (value) => Array.isArray(value) && value.length === 0;
            const result = removeEmptyKeys(input, removeEmptyArray);
            expect(result).to.deep.equal({ user: { name: 'Charlie' }, tags: ['a', 'b'] });
        });
        it('should remove keys based on a numeric condition (e.g., negative numbers)', function () {
            const input = { score: 100, penalty: -10, bonus: 0, attempts: -1 };
            const removeNegative = (value) => typeof value === 'number' && value < 0;
            const result = removeEmptyKeys(input, removeNegative);
            expect(result).to.deep.equal({ score: 100, bonus: 0 });
        });
    });
    describe('immutability', function () {
        it('should return a new object instance', function () {
            const originalObject = { a: 1, b: null };
            const result = removeEmptyKeys(originalObject);
            expect(result).to.not.equal(originalObject);
        });
        it('should not modify the original object', function () {
            const originalObject = { a: 1, b: null, c: 3 };
            const originalObjectCopy = { ...originalObject };
            removeEmptyKeys(originalObject);
            expect(originalObject).to.deep.equal(originalObjectCopy);
        });
    });
});
