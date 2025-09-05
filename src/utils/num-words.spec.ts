import {expect} from 'chai';
import {numWords} from './num-words.js';

describe('numWords', function () {
  describe('Russian version (3 forms)', function () {
    const words = ['товар', 'товара', 'товаров'] as const;

    describe('integer values', function () {
      it('should return correct form for 1', function () {
        expect(numWords(1, ...words)).to.equal('товар');
        expect(numWords(21, ...words)).to.equal('товар');
        expect(numWords(101, ...words)).to.equal('товар');
      });

      it('should return correct form for numbers ending with 2-4', function () {
        expect(numWords(2, ...words)).to.equal('товара');
        expect(numWords(3, ...words)).to.equal('товара');
        expect(numWords(4, ...words)).to.equal('товара');
        expect(numWords(32, ...words)).to.equal('товара');
      });

      it('should return correct form for numbers ending with 5-9 and 0', function () {
        expect(numWords(0, ...words)).to.equal('товаров');
        expect(numWords(5, ...words)).to.equal('товаров');
        expect(numWords(9, ...words)).to.equal('товаров');
        expect(numWords(28, ...words)).to.equal('товаров');
      });

      it('should return correct form for numbers 11-19 (exception)', function () {
        expect(numWords(11, ...words)).to.equal('товаров');
        expect(numWords(12, ...words)).to.equal('товаров');
        expect(numWords(14, ...words)).to.equal('товаров');
        expect(numWords(19, ...words)).to.equal('товаров');
        expect(numWords(111, ...words)).to.equal('товаров');
      });

      it('should handle negative numbers correctly', function () {
        expect(numWords(-1, ...words)).to.equal('товар');
        expect(numWords(-2, ...words)).to.equal('товара');
        expect(numWords(-5, ...words)).to.equal('товаров');
        expect(numWords(-11, ...words)).to.equal('товаров');
      });
    });

    describe('fractional values', function () {
      it('should return the "few" form for any fractional number', function () {
        const rubleWords = ['рубль', 'рубля', 'рублей'] as const;
        expect(numWords(0.5, ...words)).to.equal('товара');
        expect(numWords(1.5, ...words)).to.equal('товара');
        expect(numWords(2.78, ...words)).to.equal('товара');
        expect(numWords(5.1, ...rubleWords)).to.equal('рубля');
        expect(numWords(-10.2, ...rubleWords)).to.equal('рубля');
      });
    });

    it('should work with different word sets', function () {
      expect(numWords(1, 'штука', 'штуки', 'штук')).to.equal('штука');
      expect(numWords(3, 'штука', 'штуки', 'штук')).to.equal('штуки');
      expect(numWords(7, 'штука', 'штуки', 'штук')).to.equal('штук');
    });
  });

  describe('English version (2 forms) with the "one" and the "few" parameter', function () {
    const words = ['item', 'items'] as const;

    describe('integer values', function () {
      it('should return singular form for 1 and -1', function () {
        expect(numWords(1, ...words)).to.equal('item');
        expect(numWords(-1, ...words)).to.equal('item');
      });

      it('should return plural form for all other integers', function () {
        expect(numWords(0, ...words)).to.equal('items');
        expect(numWords(2, ...words)).to.equal('items');
        expect(numWords(5, ...words)).to.equal('items');
        expect(numWords(11, ...words)).to.equal('items');
        expect(numWords(-2, ...words)).to.equal('items');
        expect(numWords(-15, ...words)).to.equal('items');
      });
    });

    describe('fractional values', function () {
      it('should return plural form for all fractional numbers', function () {
        expect(numWords(0.5, ...words)).to.equal('items');
        expect(numWords(1.5, ...words)).to.equal('items');
        expect(numWords(10.2, ...words)).to.equal('items');
        expect(numWords(-2.7, ...words)).to.equal('items');
      });
    });

    it('should work with different word sets', function () {
      expect(numWords(1, 'dollar', 'dollars')).to.equal('dollar');
      expect(numWords(0, 'dollar', 'dollars')).to.equal('dollars');
      expect(numWords(1.5, 'dollar', 'dollars')).to.equal('dollars');
    });
  });

  describe('English version (2 forms) with the "one" and the "many" parameter', function () {
    const words = ['item', undefined, 'items'] as const;

    describe('integer values', function () {
      it('should return singular form for 1 and -1', function () {
        expect(numWords(1, ...words)).to.equal('item');
        expect(numWords(-1, ...words)).to.equal('item');
      });

      it('should return plural form for all other integers', function () {
        expect(numWords(0, ...words)).to.equal('items');
        expect(numWords(2, ...words)).to.equal('items');
        expect(numWords(5, ...words)).to.equal('items');
        expect(numWords(11, ...words)).to.equal('items');
        expect(numWords(-2, ...words)).to.equal('items');
        expect(numWords(-15, ...words)).to.equal('items');
      });
    });

    describe('fractional values', function () {
      it('should return plural form for all fractional numbers', function () {
        expect(numWords(0.5, ...words)).to.equal('items');
        expect(numWords(1.5, ...words)).to.equal('items');
        expect(numWords(10.2, ...words)).to.equal('items');
        expect(numWords(-2.7, ...words)).to.equal('items');
      });
    });

    it('should work with different word sets', function () {
      expect(numWords(1, 'dollar', 'dollars')).to.equal('dollar');
      expect(numWords(0, 'dollar', 'dollars')).to.equal('dollars');
      expect(numWords(1.5, 'dollar', 'dollars')).to.equal('dollars');
    });
  });
});
