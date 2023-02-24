'use strict';

var css = require('css');
var extend = require('extend');

var defaultConfig = {
  baseDpr: 2, // base device pixel ratio (default: 2)
  remUnit: 75, // rem unit value (default: 75)
  remPrecision: 6, // rem value precision (default: 6)
  forcePxComment: 'px', // force px comment (default: `px`)
  keepComment: 'no', // no transform value comment (default: `no`)
};

var pxRegExp = /\b(\d+(\.\d+)?)px\b/;

function Px2rem(options) {
  this.config = {};
  extend(this.config, defaultConfig, options);
}

// generate @1x, @2x and @3x version stylesheet
Px2rem.prototype.generateThree = function (cssText, dpr) {
  console.log('cssText', cssText);
  dpr = dpr || 2;
  var self = this;
  var config = self.config;
  var astObj = css.parse(cssText);
  // console.log('astObj', JSON.stringify(astObj, null, 2));

  function processRules(rules) {
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      // 媒体查询
      if (rule.type === 'media') {
        processRules(rule.rules); // recursive invocation while dealing with media queries
        continue;
        // 动画
      } else if (rule.type === 'keyframes') {
        processRules(rule.keyframes); // recursive invocation while dealing with keyframes
        continue;
        //
      } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
        continue;
      }

      var declarations = rule.declarations;

      for (var j = 0; j < declarations.length; j++) {
        var declaration = declarations[j];
        // need transform: declaration && has 'px'
        if (
          // 这里使用了正则进行匹配
          // prettier-ignore
          declaration.type === "declaration" && pxRegExp.test(declaration.value)
        ) {
          var nextDeclaration = rule.declarations[j + 1];
          // 注释
          if (nextDeclaration && nextDeclaration.type === 'comment') {
            // 不进行转化
            // next next declaration is comment
            if (nextDeclaration.comment.trim() === config.keepComment) {
              // no transform
              declarations.splice(j + 1, 1); // delete corresponding comment // 完事，把注释删掉
              continue;
            } else if (
              // px注释？保持px
              nextDeclaration.comment.trim() === config.forcePxComment
            ) {
              // force px
              declarations.splice(j + 1, 1); // delete corresponding comment // 完事，把注释删掉
            }
          }
          // 计算值
          declaration.value = self._getCalcValue('px', declaration.value, dpr); // common transform
          // console.log('declaration.value', declaration.value);
        }
      }
    }
  }

  processRules(astObj.stylesheet.rules);
  // console.log('out-astObj', JSON.stringify(astObj, null, 2));

  return css.stringify(astObj);
};

// generate rem version stylesheet
Px2rem.prototype.generateRem = function (cssText) {
  var self = this;
  var config = self.config;
  var astObj = css.parse(cssText);
  /**
   * 规则处理函数
   * @param {*} rules  规则
   * @param {*} noDealPx  不处理px,默认是false
   */
  function processRules(rules, noDealPx) {
    // FIXME: keyframes do not support `force px` comment
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.type === 'media') {
        // 处理媒体查询时的递归调用
        processRules(rule.rules); // recursive invocation while dealing with media queries
        continue;
      } else if (rule.type === 'keyframes') {
        // 处理关键帧时的递归调用
        processRules(rule.keyframes, true); // recursive invocation while dealing with keyframes
        continue;
      } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
        continue;
      }
      // 生成 [data-dpr=
      if (!noDealPx) {
        // generate 3 new rules which has [data-dpr]
        var newRules = [];
        for (var dpr = 1; dpr <= 3; dpr++) {
          var newRule = {};
          newRule.type = rule.type;
          newRule.selectors = rule.selectors.map(function (sel) {
            return '[data-dpr="' + dpr + '"] ' + sel;
          });
          newRule.declarations = [];
          newRules.push(newRule);
        }
      }

      var declarations = rule.declarations;
      for (var j = 0; j < declarations.length; j++) {
        var declaration = declarations[j];
        // need transform: declaration && has 'px'
        // prettier-ignore
        if (declaration.type === "declaration" && pxRegExp.test(declaration.value)) {
          // 多取一个主要用后面的注释，做规则处理
          var nextDeclaration = declarations[j + 1];
          if (nextDeclaration && nextDeclaration.type === "comment") {
            // next next declaration is comment
            if (nextDeclaration.comment.trim() === config.forcePxComment) {
              // force px
              // do not transform `0px`
              if (declaration.value === "0px") {
                declaration.value = "0";
                declarations.splice(j + 1, 1); // delete corresponding comment
                continue;
              }
              if (!noDealPx) {
                // generate 3 new declarations and put them in the new rules which has [data-dpr]
                for (var dpr = 1; dpr <= 3; dpr++) {
                  var newDeclaration = {};
                  extend(true, newDeclaration, declaration);
                  // prettier-ignore
                  newDeclaration.value = self._getCalcValue("px", newDeclaration.value, dpr);
                  newRules[dpr - 1].declarations.push(newDeclaration);
                  console.log('newRules',JSON.stringify(newRules, null,1))
                }
                // 这里生成新的规则，将原规则，和注释删除
                declarations.splice(j, 2); // delete this rule and corresponding comment
                // 因为删了两个，增加了一个，所以要会退一个
                j--;
              } else {
                // FIXME: keyframes do not support `force px` comment
                // prettier-ignore
                declaration.value = self._getCalcValue("rem", declaration.value); // common transform
                declarations.splice(j + 1, 1); // delete corresponding comment
              }
              // 这里保留注释
            } else if (nextDeclaration.comment.trim() === config.keepComment) {
              // no transform
              declarations.splice(j + 1, 1); // delete corresponding comment
            } else {
              // 普通的转化
              declaration.value = self._getCalcValue("rem", declaration.value); // common transform
            }
          } else {
            declaration.value = self._getCalcValue("rem", declaration.value); // common transform // 普通转化
          }
        }
      }
      // 如果原始规则没有声明，请删除它
      // if the origin rule has no declarations, delete it
      if (!rules[i].declarations.length) {
        rules.splice(i, 1);
        i--;
      }

      if (!noDealPx) {
        // 添加包含强制使用px的声明的新规则
        // add the new rules which contain declarations that are forced to use px
        if (newRules[0].declarations.length) {
          rules.splice(i + 1, 0, newRules[0], newRules[1], newRules[2]);
          i += 3; // skip the added new rules
        }
      }
    }
  }

  processRules(astObj.stylesheet.rules);
  return css.stringify(astObj);
};

// get calculated value of px or rem
Px2rem.prototype._getCalcValue = function (type, value, dpr) {
  console.log('type, value, dpr', type, value, dpr);
  var config = this.config;
  var pxGlobalRegExp = new RegExp(pxRegExp.source, 'g');

  function getValue(val) {
    // 计算取多少位精度
    val = parseFloat(val.toFixed(config.remPrecision)); // control decimal precision of the calculated value
    return val == 0 ? val : val + type;
  }
  // 值进行替换操作
  return value.replace(pxGlobalRegExp, function ($0, $1) {
    // prettier-ignore
    return type === "px" ? getValue(($1 * dpr) / config.baseDpr) /*保持px*/: getValue($1 / config.remUnit)/*转为rem */;
  });
};

module.exports = Px2rem;
