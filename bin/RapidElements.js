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
    // optional reference to real DOM node
    constructor(type, props2 = {}, children = []) {
      this.type = type;
      this.props = props2;
      this.children = children;
    }
    // render the VElement to a real DOM node
    render() {
      if (typeof this === "string") return document.createTextNode(this);
      const el = document.createElement(this.type);
      for (const [key, value] of Object.entries(this.props)) {
        if (key.startsWith("on") && typeof value === "function") {
          el.addEventListener(key.substring(2).toLowerCase(), value);
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
  function interpolate(templateString, props) {
    return templateString.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
      try {
        console.log(expr, eval(expr));
        return new Function("props", `return ${expr.trim()}`)(props);
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
  function fragmentToVElement(fragment, props2) {
    const vels = [];
    Array.from(fragment.children).forEach((el) => {
      const html = interpolate(el.outerHTML, props2);
      const temp = document.createElement("div");
      temp.innerHTML = html;
      Array.from(temp.children).forEach((newEl) => {
        let tc = createComponent(newEl);
        if (tc !== false) {
          vels.push(tc.render());
          return;
        }
        const vel = domToVElement(newEl);
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
    constructor(template, component, props2 = []) {
      this.template = template;
      this.component = component;
      this.props = props2;
    }
    render() {
      const attrs = {};
      Array.from(this.component.attributes).forEach((attr) => {
        attrs[attr.name] = interpolate(attr.value, this.props);
      });
      let element = new VElement("div", {}, []);
      Array.from(this.component.children).forEach((child) => {
        let comp = createComponent(child);
        if (comp) {
          element.children.push(comp.render());
        } else {
          element.children.push(domToVElement(child));
        }
      });
      attrs["children"] = element.render().innerHTML;
      const children = fragmentToVElement(this.template.content, attrs);
      console.log("children", attrs["children"]);
      const vel = new VElement("div", attrs, children);
      console.log(vel);
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
  var CounterButton = class extends Component {
    state = { count: 0 };
    render() {
      return new VElement("button", { onclick: () => this.increment() }, [
        `Count: ${this.state.count}`
      ]);
    }
    increment() {
      this.state.count++;
      update();
    }
  };
  components.push(new CounterButton());
  function update() {
    const vdom2 = new VElement("div", { id: "app" }, components.map((component) => component.render()));
    const root2 = document.getElementById("root");
    if (root2) {
      root2.innerHTML = "";
      root2.appendChild(vdom2.render());
    }
  }
  var vdom = new VElement("div", { id: "app" }, components.map((component) => component.render()));
  var root = document.getElementById("root");
  if (root) root.appendChild(vdom.render());
})();
