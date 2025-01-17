'use strict';

var assert = require('assert');
var Px2rem = require('../lib/px2rem');
var path = require('path');
var fs = require('fs');
// import: 测试用例
describe('should work with @2x origin css file', function () {
  var px2remIns = new Px2rem(/*{remUnit: 75, baseDpr: 2}*/);
  var srcPath1 = path.join(__dirname, 'assets/test.css');
  var srcPath = path.join(__dirname, 'assets/test.2x.css');
  var srcText = fs.readFileSync(srcPath, { encoding: 'utf8' });
  var srcText1 = fs.readFileSync(srcPath1, { encoding: 'utf8' });

  it('[default] test', function () {
    var outputText = px2remIns.generateThree(srcText1, 1);
    // console.log('expectedPath', expectedPath);
    console.log('outputText', outputText);
    assert.equal('1', '1');
  });
  it('[default] should output right rem file', function () {
    var expectedPath = path.join(__dirname, 'output/default.rem.css');
    var outputText = px2remIns.generateRem(srcText);
    console.log('expectedPath', expectedPath);
    // console.log('outputText', outputText);
    assert.equal(outputText, fs.readFileSync(expectedPath, { encoding: 'utf8' }));
  });

  //   it('should output right @1x file', function () {
  //     var expectedPath = path.join(__dirname, 'output/default.1x.css');
  //     var outputText = px2remIns.generateThree(srcText, 1);
  //     assert.equal(outputText, fs.readFileSync(expectedPath, { encoding: 'utf8' }));
  //   });

  //   it('should output right @2x file', function () {
  //     var expectedPath = path.join(__dirname, 'output/default.2x.css');
  //     var outputText = px2remIns.generateThree(srcText, 2);
  //     assert.equal(outputText, fs.readFileSync(expectedPath, { encoding: 'utf8' }));
  //   });

  //   it('should output right @3x file', function () {
  //     var expectedPath = path.join(__dirname, 'output/default.3x.css');
  //     var outputText = px2remIns.generateThree(srcText, 3);
  //     assert.equal(outputText, fs.readFileSync(expectedPath, { encoding: 'utf8' }));
  //   });
  // });

  // describe('should work with @3x origin css file', function () {
  //   var px2remIns = new Px2rem({ remUnit: 112.5, baseDpr: 3 });
  //   var srcPath = path.join(__dirname, 'assets/test.3x.css');
  //   var srcText = fs.readFileSync(srcPath, { encoding: 'utf8' });

  //   it('[default] should output right rem file', function () {
  //     var expectedPath = path.join(__dirname, 'output/default.rem.css');
  //     var outputText = px2remIns.generateRem(srcText);
  //     assert.equal(outputText, fs.readFileSync(expectedPath, { encoding: 'utf8' }));
  //   });

  //   it('should output right @1x file', function () {
  //     var expectedPath = path.join(__dirname, 'output/default.1x.css');
  //     var outputText = px2remIns.generateThree(srcText, 1);
  //     assert.equal(outputText, fs.readFileSync(expectedPath, { encoding: 'utf8' }));
  //   });

  //   it('should output right @2x file', function () {
  //     var expectedPath = path.join(__dirname, 'output/default.2x.css');
  //     var outputText = px2remIns.generateThree(srcText, 2);
  //     assert.equal(outputText, fs.readFileSync(expectedPath, { encoding: 'utf8' }));
  //   });

  //   it('should output right @3x file', function () {
  //     var expectedPath = path.join(__dirname, 'output/default.3x.css');
  //     var outputText = px2remIns.generateThree(srcText, 3);
  //     assert.equal(outputText, fs.readFileSync(expectedPath, { encoding: 'utf8' }));
  //   });
});
