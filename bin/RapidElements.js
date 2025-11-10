"use strict";
(() => {
  // src/VElement.ts
  var componentRegistry = {};
  var templates = document.querySelectorAll("template[rapid-name]");
  templates.forEach((t) => {
    const name = t.getAttribute("rapid-name");
    if (name) {
      componentRegistry[name] = t;
    }
  });
  var VElement = class _VElement {
    type;
    props;
    children;
    dom;
    instance;
    constructor(type, props2 = {}, children = [], instance) {
      this.type = type;
      this.props = props2;
      this.children = children;
      this.instance = instance;
    }
    render() {
      if (typeof this === "string") return document.createTextNode(this);
      const el = document.createElement(this.type);
      for (const [key, value] of Object.entries(this.props)) {
        el.setAttribute(key, value);
        if (key.startsWith("on") && typeof value === "function") {
          const eventName = key.slice(2).toLowerCase();
          el.addEventListener(eventName, value);
        } else {
          el.setAttribute(key, value);
        }
      }
      this.children.forEach((child) => {
        const childNode = child instanceof _VElement ? child.render() : document.createTextNode(child);
        el.appendChild(childNode);
      });
      this.dom = el;
      return el;
    }
  };
  function interpolate(templateString, props2, instance = "") {
    return templateString.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
      try {
        expr = expr.replace("this", instance);
        return new Function("props", `return ${expr.trim()}`)(props2);
      } catch (e) {
        console.warn(`Failed to evaluate expression: ${expr}`, e);
        return "";
      }
    });
  }
  function domToVElement(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;
      const props2 = {};
      Array.from(el.attributes).forEach((attr) => {
        props2[attr.name] = attr.value;
      });
      const children = Array.from(el.childNodes).map(domToVElement);
      return new VElement(el.tagName.toLowerCase(), props2, children);
    }
    return "";
  }
  function fragmentToVElement(fragment, props2, instance = "") {
    const vels = [];
    Array.from(fragment.children).forEach((el) => {
      const html = interpolate(el.outerHTML, props2, instance);
      const temp = document.createElement("div");
      temp.innerHTML = html;
      Array.from(temp.children).forEach((newEl) => {
        let tc = createComponent(newEl);
        if (tc !== false) {
          vels.push(tc.render());
          return;
        }
        const vel = domToVElement(newEl);
        vel.instance = instance;
        vels.push(vel);
      });
    });
    return vels;
  }
  function createComponent(el) {
    let tagname = el.tagName.toLocaleLowerCase();
    if (Object.keys(componentRegistry).includes(tagname)) {
      let tc = new TemplateComponent(componentRegistry[tagname], el);
      return tc;
    }
    return false;
  }

  // src/Component.ts
  var Component = class {
  };
  var TemplateComponent = class {
    template;
    component;
    props;
    instance;
    state;
    constructor(template, component, props = []) {
      this.template = template;
      this.component = component;
      this.props = props;
      const dataStr = template.getAttribute("rapid-data");
      if (dataStr) {
        this.instance = "blabla";
        const str = `new ${dataStr}()`;
        window[this.instance] = eval(str);
      }
      this.state = JSON.parse(template.getAttribute("state"));
    }
    render() {
      let element = new VElement("div", {}, []);
      const attrs = {};
      Array.from(this.component.attributes).forEach((attr) => {
        attrs[attr.name] = interpolate(attr.value, this.props, this.instance);
      });
      Array.from(this.component.children).forEach((child) => {
        let comp = createComponent(child);
        if (comp) {
          comp.instance = this.instance;
          element.children.push(comp.render());
        } else {
          const element2 = domToVElement(child);
          element2.children.push(element2);
        }
      });
      attrs["children"] = element.render().innerHTML;
      const children = fragmentToVElement(this.template.content, attrs, this.instance);
      const vel = new VElement("div", attrs, children, this.data);
      return vel;
    }
  };

  // src/main.ts
  var components = [];
  var templates2 = document.querySelectorAll("template[rapid-name]");
  templates2.forEach((t) => {
    const rapidName = t.getAttribute("rapid-name") || "";
    const docComps = document.getElementsByTagName(rapidName);
    Array.from(docComps).forEach((el) => {
      const tc = new TemplateComponent(t, el);
      components.push(tc);
    });
  });
  var vdom = new VElement("div", { id: "app" }, components.map((component2) => component2.render()));
  var root = document.getElementById("root");
  if (root) root.appendChild(vdom.render());
  window.update = () => {
    const root2 = document.getElementById("root");
    if (root2) {
      root2.innerHTML = "";
      root2.appendChild(vdom.render());
    }
  };
})();
