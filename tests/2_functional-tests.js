const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // Test 1: Viewing one stock
  test('Viewing one stock', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        done();
      });
  });

  // Test 2: Viewing one stock and liking it
  test('Viewing one stock and liking it', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.isAtLeast(res.body.stockData.likes, 1);
        done();
      });
  });

  // Test 3: Viewing the same stock and liking it again
  test('Viewing the same stock and liking it again', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function(err, res) {
        const firstLikeCount = res.body.stockData.likes;
        
        // Liking it again
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'GOOG', like: true })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body.stockData);
            assert.property(res.body.stockData, 'stock');
            assert.property(res.body.stockData, 'price');
            assert.property(res.body.stockData, 'likes');
            assert.equal(res.body.stockData.likes, firstLikeCount); // Likes shouldn't increase
            done();
          });
      });
  });

  // Test 4: Viewing two stocks
  test('Viewing two stocks', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[1], 'price');
        done();
      });
  });

  // Test 5: Viewing two stocks and liking them
  test('Viewing two stocks and liking them', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'rel_likes');
        done();
      });
  });

});