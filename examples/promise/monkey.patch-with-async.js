//
// It is now possible to monkey patch using promise returning functions instead.
//

require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../../lib/main');
}

// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// Monkey patching need to be implemented before creating the browser.
wd.webdriver.prototype.elementByCssSelectorWhenReady = function(selector, timeout/*, cb*/) {
  // 'wd.findCallback' is a small helper which looks for the callback in a safe way, and avoids
  // hanging when the number of arguments passed is wrong.
  // There is also a 'wd.varargs' for methods with variable argument number.
  var cb = wd.findCallback(arguments);

  var _this = this;
  this.waitForElementByCssSelector(selector, timeout, function() {
    _this.elementByCssSelector(selector, cb);
  });
};

// Actualises the promise wrappers
wd.rewrap();

var browser = wd.promiseChainRemote();

// optional extra logging
//browser._debugPromise();
browser.on('status', function(info) {
  console.log(info.cyan);
});
browser.on('command', function(meth, path, data) {
  console.log(' > ' + meth.yellow, path.grey, data || '');
});

browser
  .init({browserName:'chrome'})
  .get("http://admc.io/wd/test-pages/guinea-pig.html")
  .title()
  .should.become('I am a page title - Sauce Labs')
  .elementByCssSelector('#comments').getTagName().should.become('textarea')
  .elementByCssSelectorWhenReady('#comments', 2000)
    .should.eventually.exist
  .elementByCssSelectorWhenReady('#comments', 2000)
    .type('Bonjour!').getValue().should.become('Bonjour!')
  .fin(function() { return browser.quit(); })
  .done();
