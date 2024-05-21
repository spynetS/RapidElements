function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
/**
 * default component class which all component scripts have to extend
 * */
class Component {
  constructor() {
    this.self = "asd";
    this.props = {};
  }

  /**
   * This function will be called when the component is loaded on the page
   * use this as a constructor.
   * */
  onComponentLoad() {}
  /**
   * This function returns the element with the child-id provided.
   * REMEMEBER this function will not work before onComponentLoad is run
   * */
  getChild(name) {
    let res = document.querySelectorAll(
      `[child-id="RAPID${this.self + name}"]`,
    );
    return res[0];
  }
  /**
   * This function retusns instance of the child component if there is one otherwise undefined.
   * REMEMEBER this function will not work before onComponentLoad is run
   * */
  getChildInstance(name) {
    let child = document.querySelectorAll(
      `[child-id="RAPID${this.self + name}"]`,
    )[0];
    if (child === undefined) return undefined;
    let instanceName = child.getAttribute("instance");
    if (instanceName === null) {
      instanceName = child.firstElementChild.getAttribute("instance");
      if (instanceName === null) return null;
    }
    let instance = eval(`${instanceName}`);
    return instance;
  }
}

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
  console.log(templates);

  // list that holds all components
  let components = [];
  // for each template
  for (let [name, template] of Object.entries(templates)) {
    // find all components that uses template name
    let htmlcomponents = document.getElementsByTagName(name);
    console.log(htmlcomponents);
    // for each component that uses this template
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
function rapidRefresh() {
  replaceComponents();
}

async function main() {
  // try to include html
  includeHTML();
  // document = doc;

  //replace all componments
  replaceComponents();

  replaceMd();
  // creates a tailwind override class, to be applied to markdown defined elements.
  createNoTailwindClass();
}

window.onload = main();

function createNoTailwindClass() {
  const style = document.createElement("style");
  style.innerHTML = `
      .no-tailwind h1,
      .no-tailwind h2,
      .no-tailwind h3,
      .no-tailwind h4,
      .no-tailwind h5,
      .no-tailwind h6,
      .no-tailwind p,
      .no-tailwind div,
      .no-tailwind span,
      .no-tailwind a,
      .no-tailwind ul,
      .no-tailwind li,
      .no-tailwind table,
      .no-tailwind tr,
      .no-tailwind th,
      .no-tailwind td {
          all: revert;
          font-family: inherit;
          color: inherit;
          background-color: inherit;
      }
  `;
  document.head.appendChild(style);
}

function parseMd(markdown) {
  // Convert headers
  markdown = markdown.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  markdown = markdown.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  markdown = markdown.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  markdown = markdown.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  markdown = markdown.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  markdown = markdown.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Convert bold text
  markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>");
  markdown = markdown.replace(/__(.*?)__/gim, "<b>$1</b>");

  // Convert italic text
  markdown = markdown.replace(/\*(.*?)\*/gim, "<i>$1</i>");
  markdown = markdown.replace(/_(.*?)_/gim, "<i>$1</i>");

  // Convert links
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  // Convert unordered lists
  markdown = markdown.replace(/^\s*\n\* (.*)/gim, "<ul>\n<li>$1</li>\n</ul>");
  markdown = markdown.replace(/^\* (.*)/gim, "<li>$1</li>");

  // Convert ordered lists
  markdown = markdown.replace(/^\s*\n\d\. (.*)/gim, "<ol>\n<li>$1</li>\n</ol>");
  markdown = markdown.replace(/^\d\. (.*)/gim, "<li>$1</li>");

  // Convert blockquotes
  markdown = markdown.replace(/^\> (.*)/gim, "<blockquote>$1</blockquote>");

  // Convert line breaks
  markdown = markdown.replace(/\n$/gim, "<br />");

  return markdown.trim();
}

// searches all elements with attribute markdown and replaces the markdown inside with
// html code
function replaceMd() {
  let markdowns = document.querySelectorAll("[markdown]");
  for (let i = 0; i < markdowns.length; i++) {
    let elmnt = markdowns[i];
    to_convert = elmnt.innerHTML;
    elmnt.classList.add("no-tailwind");
    converted = parseMd(to_convert);
    elmnt.innerHTML = converted;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll("[include-md]");

  elements.forEach(function (elmnt) {
    const include_md = elmnt.getAttribute("include-md");
    if (include_md) {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = parseMd(this.responseText);
            elmnt.classList.add("no-tailwind");
          }
          if (this.status == 404) {
            elmnt.innerHTML = "Page not found.";
          }
        }
      };
      xhttp.open("GET", include_md, true);
      xhttp.send();
    }
  });
});

