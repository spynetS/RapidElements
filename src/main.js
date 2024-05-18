/**
 * default component class which all component scripts have to extend
 * */
class Component {
  constructor() {
    this.self = "asd";
    this.props = {};
  }
  onComponentLoad() {}
  getChild(name) {
    return document.querySelectorAll(
      `[child-id="RAPID${this.self + name}"]`,
    )[0];
  }
}

// this attribute is used to locate componente tagNames
const attribute = "component-name";
const component_definition = "component-definition";
const start_prop = "{";
const end_prop = "}";

function parseMd(markdown) {
  // Convert headers
  markdown = markdown.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  markdown = markdown.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  markdown = markdown.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  markdown = markdown.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  markdown = markdown.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  markdown = markdown.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold text
  markdown = markdown.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
  markdown = markdown.replace(/__(.*?)__/gim, '<b>$1</b>');

  // Convert italic text
  markdown = markdown.replace(/\*(.*?)\*/gim, '<i>$1</i>');
  markdown = markdown.replace(/_(.*?)_/gim, '<i>$1</i>');

  // Convert links
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  // Convert unordered lists
  markdown = markdown.replace(/^\s*\n\* (.*)/gim, '<ul>\n<li>$1</li>\n</ul>');
  markdown = markdown.replace(/^\* (.*)/gim, '<li>$1</li>');

  // Convert ordered lists
  markdown = markdown.replace(/^\s*\n\d\. (.*)/gim, '<ol>\n<li>$1</li>\n</ol>');
  markdown = markdown.replace(/^\d\. (.*)/gim, '<li>$1</li>');

  // Convert blockquotes
  markdown = markdown.replace(/^\> (.*)/gim, '<blockquote>$1</blockquote>');

  // Convert line breaks
  markdown = markdown.replace(/\n$/gim, '<br />');

  return markdown.trim();
}

document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll('[include-md]');
  
  elements.forEach(function(elmnt) {
    const include_md = elmnt.getAttribute("include-md");
    if (include_md) {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
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

function createNoTailwindClass() {
  const style = document.createElement('style');
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

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("include-html");
    dev = elmnt.getAttribute("include-dev");
    if (file && dev == "true") {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", file, false);
      rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
          if (rawFile.status === 200 || rawFile.status == 0) {
            var allText = rawFile.responseText;
          }
        }
      };
      rawFile.send(null);
    } else if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = this.responseText;
          }
          if (this.status == 404) {
            elmnt.innerHTML = "Page not found.";
          }
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("include-html");
          replaceComponents();
          includeHTML();
        }
      };
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }

  }
}

function getPropsToJs(oldElement){
  let propNames = oldElement.getAttributeNames();
  let props = {};
  for (let i = 0; i < propNames.length; i++) {
    props[propNames[i]] = oldElement.getAttribute(propNames[i])
  }
  return props;
}

function replaceProps(oldElement, newHtml) {
  //replace innerHTML
  let childrenString = "";
  childrenString = oldElement.innerHTML;
  newHtml = newHtml.replaceAll(
    `${start_prop}children${end_prop}`,
    childrenString,
  );

  //replace all props with the component attriubtes corosponsing with that name
  // <component name="test"/> of <h1>{name}</h1> becomes <h1>test</h1>
  let propNames = oldElement.getAttributeNames();
  for (let i = 0; i < propNames.length; i++) {
    // if the propname is child-id we want to
    // add the id to the replaced componment
    // we load in the html string in an element add the atribute to the first
    // element and reset the string with the new element
    if (propNames[i] === "child-id") {
      var tempContainer = document.createElement("div");
      tempContainer.innerHTML = newHtml;

      var element = tempContainer.firstElementChild;

      element.setAttribute("child-id", oldElement.getAttribute(propNames[i]));
      newHtml = element.outerHTML;
    }
    else {
      newHtml = newHtml.replaceAll(
        `${start_prop}${propNames[i]}${end_prop}`,
        oldElement.getAttribute(propNames[i]),
      );
    }
  }

  return newHtml;
}

function getClassName(scriptContent) {
  // Match the class name using a regular expression
  const classNameMatch = scriptContent.match(/class\s+([^\s{]+)/);
  // Check if a match was found
  if (classNameMatch && classNameMatch.length > 1) {
    return classNameMatch[1];
  } else {
    return null;
  }
}

function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function addInstance(script, instanceName, props) {
  let className = getClassName(script.innerHTML);
  if (className != null) {
    const scriptElement = document.createElement("script");
    scriptElement.textContent = `let ${instanceName} = new ${className}();${instanceName}.self = "${instanceName}";${instanceName}.props = ${JSON.stringify(props)};${instanceName}.onComponentLoad()`;
    document.body.appendChild(scriptElement);
  }
}

function replaceAll(string, find, replace) {
  // Create a regular expression with the 'g' flag to match all occurrences
  const regex = new RegExp(find, "g");
  // Use the replace method with the regex to replace all occurrences
  return string.replace(regex, replace);
}

function replaceComponents() {
  //this lists holds all template values
  let componentDefinitions = [];
  // fetch the component definitions
  let templates = document.getElementsByTagName("template");
  for (let i = templates.length - 1; i >= 0; i--) {
    let component = templates[i];
    let name = component.getAttribute("rapid-name");
    let script = component.content.children[0];

    // add script element from component template outside the template
    const scriptElement = document.createElement("script");
    scriptElement.textContent = script.innerHTML;

    scriptElement.setAttribute("rapid-script", name);
    document.body.appendChild(scriptElement);

    componentDefinitions.push([name, component.innerHTML]);
  }

  let comps = []; // list to hold the components we want to replace and what we want to replace them with
  for (let i = 0; i < componentDefinitions.length; i++) {
    // all the elements with tagname corosponding with a component-definitinos (rapid-name)
    let components = document.getElementsByTagName(componentDefinitions[i][0]);
    for (let j = 0; j < components.length; j++) {
      // find the script from the card
      let script = document.querySelectorAll(
        `[rapid-script="${components[j].localName}"]`,
      )[0];
      let instanceName = generateRandomString(10);

      let content = replaceProps(components[j], componentDefinitions[i][1]);


      // add instance id to child ids
      var parser = new DOMParser();
      var doc = parser.parseFromString(content, "text/html");
      // Step 3: Query for the desired element in the parsed document
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
      content = doc.body.innerHTML;

      // replace all selfs with the instance id
      content = replaceAll(content, "self", `${instanceName}`);

      const props = getPropsToJs(components[j]);
      // replace the component
      components[j].outerHTML = content;
      // add instance of script
      addInstance(script, instanceName,props);

      j--; // we go back a step because we have to (i don't really know but it somehow also makes sense -_ö_-)
    }
  }
}

// searches all elements with attribute markdown and replaces the markdown inside with
// html code
function replaceMd(){
  let markdowns = document.querySelectorAll("[markdown]");
  for(let i = 0; i < markdowns.length; i ++){
    let elmnt = markdowns[i];
    to_convert = elmnt.innerHTML;
    elmnt.classList.add("no-tailwind")
    converted = parseMd(to_convert);
    elmnt.innerHTML = converted;
  }
}

function main() {
  //try to include html
  includeHTML();
  //replace all componments
  replaceComponents();

  replaceMd();
  // creates a tailwind override class, to be applied to markdown defined elements.
  createNoTailwindClass();
}

window.onload = main();
