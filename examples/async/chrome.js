require('colors');
var chai = require('chai');
chai.should();

var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../../lib/main');
}

var browser = wd.remote();

// optional extra logging
browser.on('status', function(info) {
  console.log(info.cyan);
});
browser.on('command', function(meth, path, data) {
  console.log(' > ' + meth.yellow, path.grey, data || '');
});

browser.init({browserName:'chrome'}, function() {
  browser.get("http://admc.io/wd/test-pages/guinea-pig.html", function() {
    browser.title(function(err, title) {
      title.should.include('I am a page title - Sauce Labs');
      browser.elementById('i am a link', function(err, el) {
        browser.clickElement(el, function() {
          /* jshint evil: true */
          browser.eval("window.location.href", function(err, href) {
            href.should.include('guinea-pig2');
            browser.quit();
          });
        });
      });
    });
  });
});
