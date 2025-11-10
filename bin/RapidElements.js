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
    removeChild(child) {
      if (child instanceof _VElement && child.dom && this.dom) {
        this.dom.removeChild(child.dom);
        this.children = this.children.filter((c) => c !== child);
      } else if (typeof child === "string" && this.dom) {
        const textNode = Array.from(this.dom.childNodes).find((n) => n.nodeType === 3 && n.nodeValue === child);
        if (textNode) {
          this.dom.removeChild(textNode);
          this.children = this.children.filter((c) => c !== child);
        }
      }
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
  function randomVarName(length = 8) {
    const firstChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$_";
    const otherChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_";
    let result = firstChars[Math.floor(Math.random() * firstChars.length)];
    for (let i = 1; i < length; i++) {
      const idx = Math.floor(Math.random() * otherChars.length);
      result += otherChars[idx];
    }
    return result;
  }
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
        this.instance = randomVarName();
        const str = `new ${dataStr}()`;
        window[this.instance] = eval(str);
      }
      this.state = JSON.parse(template.getAttribute("state"));
    }
    render() {
      const props2 = {};
      for (const attr of this.component.attributes) {
        if (attr.name.startsWith(":")) {
          props2[attr.name.replace(":", "")] = attr.value.replace(/this/g, this.instance);
        } else {
          props2[attr.name] = attr.value;
        }
      }
      const children = fragmentToVElement(this.template.content, props2, this.instance);
      const vel = new VElement("div", [], children);
      return vel;
    }
  };

  // src/rerender.ts
  function diff(oldVNode2, newVNode, parentDom) {
    if (typeof oldVNode2 === "string" && typeof newVNode === "string") {
      if (oldVNode2 !== newVNode) {
        const textNode = document.createTextNode(newVNode);
        parentDom.replaceChild(textNode, parentDom.childNodes[0]);
      }
      return newVNode;
    }
    if (oldVNode2 instanceof VElement && newVNode instanceof VElement && oldVNode2.type !== newVNode.type) {
      const newEl = newVNode.render();
      parentDom.replaceChild(newEl, oldVNode2.dom);
      return newVNode;
    }
    if (typeof newVNode === "string" && oldVNode2 instanceof VElement) {
      const textNode = document.createTextNode(newVNode);
      parentDom.replaceChild(textNode, oldVNode2.dom);
      return newVNode;
    }
    if (typeof oldVNode2 === "string" && newVNode instanceof VElement) {
      const newEl = newVNode.render();
      parentDom.replaceChild(newEl, parentDom.childNodes[0]);
      return newVNode;
    }
    if (oldVNode2 instanceof VElement && newVNode instanceof VElement) {
      const el = newVNode.dom = oldVNode2.dom;
      updateProps(el, oldVNode2.props, newVNode.props);
      diffChildren(el, oldVNode2.children, newVNode.children);
      return newVNode;
    }
  }
  function updateProps(el, oldProps, newProps) {
    for (const key in oldProps) {
      if (!(key in newProps)) {
        if (key.startsWith("on")) {
          el.removeEventListener(key.slice(2).toLowerCase(), oldProps[key]);
        } else {
          el.removeAttribute(key);
        }
      }
    }
    for (const key in newProps) {
      const oldVal = oldProps[key];
      const newVal = newProps[key];
      if (oldVal !== newVal) {
        if (key.startsWith("on") && typeof newVal === "function") {
          if (oldVal) el.removeEventListener(key.slice(2).toLowerCase(), oldVal);
          el.addEventListener(key.slice(2).toLowerCase(), newVal);
        } else {
          el.setAttribute(key, newVal);
        }
      }
    }
  }
  function diffChildren(parent, oldChildren, newChildren) {
    const maxLen = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLen; i++) {
      const oldChild = oldChildren[i];
      const newChild = newChildren[i];
      if (oldChild && !newChild) {
        const childDom = oldChild instanceof VElement ? oldChild.dom : parent.childNodes[i];
        parent.removeChild(childDom);
        continue;
      }
      if (!oldChild && newChild) {
        const newDom = newChild instanceof VElement ? newChild.render() : document.createTextNode(newChild);
        parent.appendChild(newDom);
        if (newChild instanceof VElement) newChild.dom = newDom;
        continue;
      }
      diff(oldChild, newChild, parent);
    }
  }

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
  var root = document.getElementById("root");
  var oldVNode = null;
  window.render = (vnode) => {
    oldVNode = oldVNode ? diff(oldVNode, vnode, root) : vnode;
    if (!oldVNode.dom) root.appendChild(vnode.render());
  };
  window.update = () => {
    render(new VElement("div", { id: "app" }, components.map((component2) => component2.render())));
  };
  update();
})();
