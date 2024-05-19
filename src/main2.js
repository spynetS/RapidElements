const start_prop = "{";
const end_prop = "}";

class Template {
  constructor() {
    this.className = "";
    this.name = "";
    this.script = null;
    this.html = null;
  }
  /** Adds script to body */
  createScript() {
    let script = document.createElement("script");
    script.textContent = this.script.innerHTML;
    document.body.appendChild(script);
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
  }
  replaceProps() {
    //replace the the {children} with the components innerhtml
    this.html = this.html.replaceAll(
      `${start_prop}children${end_prop}`,
      this.defintion.innerHTML,
    );

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
    this.html = this.html.replaceAll("self", this.instanceName);
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

function replaceComponents() {
  // find all templates
  let htmltemplates = document.getElementsByTagName("template");
  // dict that holds the templates and thier name
  let templates = new Object();
  // we loop though the templates down up so the templates
  // down can use the templates above
  for (let i = htmltemplates.length - 1; i >= 0; i--) {
    let template = new Template();
    template.name = htmltemplates[i].getAttribute("rapid-name");
    template.script = htmltemplates[i].content.querySelector("script");

    // if the template does not have a script we dont want to remove it
    // or create a script
    if (template.script !== null) {
      template.html = htmltemplates[i].innerHTML.replace(
        template.script.outerHTML,
        "",
      );
      template.createScript();
    } else {
      template.html = htmltemplates[i].innerHTML;
    }
    //set the new template
    templates[template.name] = template;
  }

  // list that holds all components
  let components = [];
  // for each template
  for (let [name, template] of Object.entries(templates)) {
    // find all components that uses template name
    let htmlcomponents = document.getElementsByTagName(name);
    //for each component that uses this template
    for (let i = 0; i < htmlcomponents.length; i++) {
      let component = new Comp();
      component.defintion = htmlcomponents[i];
      let d = document.createElement("div");
      d.innerHTML = template.html;
      component.html = d.outerHTML;
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

      //update dom with the new html
      htmlcomponents[i].outerHTML = component.html;
      components.push(component);
      i--;
    }
  }

  // Instantiate the components instancess
  for (let i = components.length - 1; i >= 0; i--) {
    // for (let i = 0; i < components.length; i++) {
    let component = components[i];
    if (component.className != null) {
      let js = `let ${component.instanceName} = new ${component.className}();`;
      js += `${component.instanceName}.self = '${component.instanceName}';`;
      js += `${component.instanceName}.props = ${JSON.stringify(component.props)};`;
      js += `${component.instanceName}.onComponentLoad();`;

      let script = document.createElement("script");
      script.textContent = js;
      document.body.appendChild(script);
    }
  }
}

// simple chatgpt say
function includeHTML() {
  const element = document.querySelector("[include-html]");
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

  return doc;
}

async function main() {
  //try to include html
  includeHTML();
  // document = doc;

  //replace all componments
  replaceComponents();

  replaceMd();
  // creates a tailwind override class, to be applied to markdown defined elements.
  createNoTailwindClass();
}

window.onload = main();
