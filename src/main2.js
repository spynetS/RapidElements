import { generateRandomString } from "./utils.js";
import Component from "./Component.js";

window.Component = Component;

import * as md from "./md.js";

const start_prop = "{";
const end_prop = "}";

const start_js = "{{";
const end_js = "}}";

class Template {
  constructor() {
    this.className = "";
    this.name = "";
    this.script = null;
    this.html = null;
  }
  /** Adds script to body */
  createScript() {
    if (
      document.querySelector(`[rapid-script="${this.getClassName()}"]`) == null
    ) {
      let script = document.createElement("script");
      script.setAttribute("rapid-script", this.getClassName());
      script.textContent = this.script.innerHTML;
      document.body.appendChild(script);
    }
  }
  /** returns the classname from the script */
  getClassName(scriptContent) {
    // Match the class name using a regular expression
    if (this.script == null) return null;
    const classNameMatch = this.script.innerHTML.match(/class\s+([^\s{]+)/);
    // Check if a match was found
    if (classNameMatch && classNameMatch.length > 1) {
      return classNameMatch[1];
    } else {
      return null;
    }
  }
}

class Comp {
  constructor() {
    this.instanceName;
    this.defintion;
    this.props;
    this.html;
    this.template = "";
  }
  replaceProps() {
    //replace the the {children} with the components innerhtml
    try {
      this.props.children = this.defintion.innerHTML;
    } catch (exception) {
      console.log(exception);
    }

    try {
      this.html = this.html.replaceAll(
        `${start_prop}children${end_prop}`,
        this.defintion.innerHTML,
      );
    } catch (exception) {
      console.log(exception);
    }
    // for each prop replace it with the value
    for (let prop of Object.entries(this.props)) {
      let key = prop[0];
      let value = prop[1];
      // if the prop is child id it with div
      if (key === "child-id") {
        var tempContainer = document.createElement("div");
        tempContainer.innerHTML = this.html;

        var element = tempContainer.firstElementChild;
        tempContainer.setAttribute("child-id", value);
        this.html = tempContainer.outerHTML;
      } else {
        this.html = this.html.replaceAll(
          `${start_prop}${key}${end_prop}`,
          value,
        );
      }
    }
  }
  /** rreplace all selfs with instance name */
  replaceSelf() {
    this.html = this.html.replaceAll("self.", this.instanceName + ".");
    this.html = this.html.replaceAll("this.", this.instanceName + ".");
  }
  /** adds instance id to child-id id */
  replaceChildId() {
    var parser = new DOMParser();
    var doc = parser.parseFromString(this.html, "text/html");
    var childElement = doc.querySelectorAll(`[child-id]`);
    for (let i = 0; i < childElement.length; i++) {
      const was = childElement[i].getAttribute("child-id");
      // if the child-id attribute has RAPID it has already
      // been changed so we should not change it now
      // (this comes from when a component is inside another component
      // and has the child-id on it)
      if (!was.includes("RAPID")) {
        childElement[i].setAttribute("child-id", "RAPIDself" + was);
      }
    }
    this.html = doc.body.innerHTML;
  }
  /** Adds instance attriubte to the compnent first child */
  setInstance() {
    this.instanceName = generateRandomString(10);
    if (this.html != null) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(this.html, "text/html");
      doc.body.firstElementChild.setAttribute("instance", this.instanceName);
      this.html = doc.body.innerHTML;
    }
  }
}
window.isInsideCompontent = (element, attributeName, value) => {
  let currentElement = element;

  while (currentElement) {
    if (currentElement.getAttribute(attributeName) === value) {
      return true;
    }
    currentElement = currentElement.parentElement; // Move up to the parent element
  }

  return false; // No parent has the attribute
};

window.replaceComponentTagName = (tagName) => {
  let template = document.querySelector(`[rapid-name="${tagName}"]`);
  // TODO add all templates which are dependences for this compontent
  replaceComponentTemplate(template);
};

window.replaceComponentTemplate = (template_element) => {
  let template = new Template();
  template.name = template_element.getAttribute("rapid-name");
  template.script = template_element.content.querySelector("script");

  if (template.script !== null) {
    template.html = template_element.innerHTML.replace(
      template.script.outerHTML,
      "",
    );
    template.createScript();
  } else {
    template.html = template_element.innerHTML;
  }

  let name = template.name;
  let components = [];
  let htmlcomponents = document.getElementsByTagName(name);
  // for each component that uses this template
  for (let i = 0; i < htmlcomponents.length; i++) {
    // If the compontent found has a parent with the attribute
    // rapid-compontent and its value is the compontent we try to compile
    // we will ignore it because it is part of the the compontent which is compiled
    if (!isInsideCompontent(htmlcomponents[i], "rapid-component", name)) {
      let component = new Comp();
      component.defintion = htmlcomponents[i];
      let d = document.createElement("div");
      d.setAttribute("rapid-component", name);
      d.innerHTML = template.html;
      component.html = d.outerHTML;
      component.template = d.innerHTML;
      component.className = template.getClassName();
      // parse attributes to a object
      component.props = Array.from(htmlcomponents[i].attributes).reduce(
        (acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        },
        {},
      );
      component.setInstance();
      component.replaceChildId();
      component.replaceProps();
      component.replaceSelf();
      // component.replaceJs();

      if (component.className != null) {
        let js = `let ${component.instanceName} = new ${component.className}();`;
        js += `${component.instanceName}.self = '${component.instanceName}';`;
        js += `${component.instanceName}.props = ${JSON.stringify(component.props)};`;
        js += `${component.instanceName}.onComponentLoad();`;
        js += `${component.instanceName}.template = '${component.template.replaceAll("\n", "")}';`;
        js += `${component.instanceName}.className = '${component.className}';`;

        let script = document.createElement("script");
        script.setAttribute("instance", component.instanceName);
        script.textContent = js;
        document.body.appendChild(script);
      }
      //update dom with the new html
      htmlcomponents[i].outerHTML = replaceJs(component.html);
      components.push(component);
      // we goback to look for more components to compile
      i--;
    }
  }
};

window.replaceComponents = () => {
  // find all templates
  let htmltemplates = document.getElementsByTagName("template");

  for (let i = htmltemplates.length - 1; i >= 0; i--) {
    replaceComponentTemplate(htmltemplates[i]);
  }
};

// simple chatgpt say
function includeHTML() {
  const element = document.querySelector("[include-html]");
  if (element === null) return null;
  const file = element.getAttribute("include-html");
  if (file) {
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((html) => {
        element.outerHTML = html;
        replaceComponents();
        includeHTML();
      })
      .catch((error) => {
        element.innerHTML = "Content not found.";
      });
  }
}

/**
 * this function recompiles new components added to the dom
 * */
window.rapidRefresh = () => {
  replaceComponents();
};

function main() {
  // try to include html
  includeHTML();
  // document = doc;
  //replace all componments
  replaceComponents();

  md.replaceMd();
  // creates a tailwind override class, to be applied to markdown defined elements.
  md.createNoTailwindClass();
  console.log("ehere");
}

window.getInstanceById = (id) => {
  let el = document.getElementById(id);
  return getInstance(el);
};

window.getInstance = (element) => {
  if (element.getAttribute("instance")) {
    let instanceName = element.getAttribute("instance");
    if (instanceName === null) {
      instanceName = element.firstElementChild.getAttribute("instance");
      if (instanceName === null) return null;
    }
    let instance = eval(`${instanceName}`);
    return instance;
  } else {
    return getInstance(element.parentElement);
  }
};
window.replaceJs = (html) => {
  // Regular expression to match {%...%} pattern
  const pattern = /\{{\s*.*?\s*\}}/g;

  const matches = html.match(pattern);
  if (matches != null) {
    for (let i = 0; i < matches.length; i++) {
      let js = matches[i].replaceAll(start_js, "");
      js = js.replaceAll(end_js, "");
      js = js.replaceAll("&gt;", ">");
      js = js.replaceAll("&lt;", "<");
      try {
        let js_value = eval(js);
        html = html.replaceAll(matches[i], js_value);
      } catch (exceprtion) {
        html = html.replaceAll(matches[i], "undefined");
      }
    }
  }
  return html;
};

window.onload = main();

window.replaceMd = md.replaceMd;

window.Comp = Comp;
