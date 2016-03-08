const babel = require('babel-core');

module.exports = (code) => {
  const result = babel.transform(wrapCode(code), {
    presets: ['react'],
  });
  return result;
}

function wrapCode(code) {
  return `
    const React = require('react');
    ${code}
  `;
}
