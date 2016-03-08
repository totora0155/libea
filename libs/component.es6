import React from 'react';
import ReactDOM from 'react-dom/server'
import HTMLtoJSX from 'htmltojsx';
import transform from './transform';

const html2jsx = new HTMLtoJSX({
  createClass: false,
});

export function createComponent(html, content) {
  return class Component extends React.Component {
    render() {
      const element = eval(transform(html2jsx.convert(html)).code);
      return element;
    }
  }
}
