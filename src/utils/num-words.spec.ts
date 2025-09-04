import {expect} from 'chai';
import {numWords} from './num-words.js';

describe('numWords', function () {
  describe('товар/товара/товаров', function () {
    it('should return correct form for 1', function () {
      expect(numWords(1, 'товар', 'товара', 'товаров')).to.equal('товар');
    });

    it('should return correct form for numbers ending with 2-4', function () {
      expect(numWords(2, 'товар', 'товара', 'товаров')).to.equal('товара');
      expect(numWords(3, 'товар', 'товара', 'товаров')).to.equal('товара');
      expect(numWords(4, 'товар', 'товара', 'товаров')).to.equal('товара');
    });

    it('should return correct form for numbers ending with 5-9 and 0', function () {
      expect(numWords(5, 'товар', 'товара', 'товаров')).to.equal('товаров');
      expect(numWords(6, 'товар', 'товара', 'товаров')).to.equal('товаров');
      expect(numWords(7, 'товар', 'товара', 'товаров')).to.equal('товаров');
      expect(numWords(8, 'товар', 'товара', 'товаров')).to.equal('товаров');
      expect(numWords(9, 'товар', 'товара', 'товаров')).to.equal('товаров');
      expect(numWords(0, 'товар', 'товара', 'товаров')).to.equal('товаров');
    });

    it('should return correct form for numbers 11-14', function () {
      expect(numWords(11, 'товар', 'товара', 'товаров')).to.equal('товаров');
      expect(numWords(12, 'товар', 'товара', 'товаров')).to.equal('товаров');
      expect(numWords(13, 'товар', 'товара', 'товаров')).to.equal('товаров');
      expect(numWords(14, 'товар', 'товара', 'товаров')).to.equal('товаров');
    });

    it('should handle numbers greater than 100', function () {
      expect(numWords(101, 'товар', 'товара', 'товаров')).to.equal('товар');
      expect(numWords(102, 'товар', 'товара', 'товаров')).to.equal('товара');
      expect(numWords(111, 'товар', 'товара', 'товаров')).to.equal('товаров');
    });

    it('should handle negative numbers', function () {
      expect(numWords(-1, 'товар', 'товара', 'товаров')).to.equal('товар');
      expect(numWords(-2, 'товар', 'товара', 'товаров')).to.equal('товара');
      expect(numWords(-5, 'товар', 'товара', 'товаров')).to.equal('товаров');
    });
  });

  describe('different word forms', function () {
    it('should work with рубль/рубля/рублей', function () {
      expect(numWords(1, 'рубль', 'рубля', 'рублей')).to.equal('рубль');
      expect(numWords(2, 'рубль', 'рубля', 'рублей')).to.equal('рубля');
      expect(numWords(5, 'рубль', 'рубля', 'рублей')).to.equal('рублей');
    });

    it('should work with штука/штуки/штук', function () {
      expect(numWords(1, 'штука', 'штуки', 'штук')).to.equal('штука');
      expect(numWords(3, 'штука', 'штуки', 'штук')).to.equal('штуки');
      expect(numWords(7, 'штука', 'штуки', 'штук')).to.equal('штук');
    });
  });
});
