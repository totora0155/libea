import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {createComponent} from './component';

export default class Processor {
  constructor(templates, renderer) {
    this.templates = templates;
    this.renderer = renderer;
  }

  process(markup) {
    let content;

    {
      const p = this.renderer.contentWillProcess
      if (p && typeof p === 'function') {
        content = this.renderer.contentWillProcess(markup);
      }
    }

    const Children = createComponent(content);
    const childElement = React.createElement(Children);

    const Component = createComponent(this.templates.base);
    const element = React.createElement(Component, null, childElement);
    const html = ReactDOMServer.renderToStaticMarkup(element);

    console.log(html);
    return html;
  }
}
