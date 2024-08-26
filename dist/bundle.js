(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/utils.js
  function generateRandomString(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  var init_utils = __esm({
    "src/utils.js"() {
    }
  });

  // src/Component.js
  var Component;
  var init_Component = __esm({
    "src/Component.js"() {
      Component = class {
        constructor() {
          this.self = "asd";
          this.props = {};
        }
        /**
         * This function will be called when the component is loaded on the page
         * use this as a constructor.
         * */
        onComponentLoad() {
        }
        /**
         * This function returns the element with the child-id provided.
         * REMEMEBER this function will not work before onComponentLoad is run
         * */
        getChild(name) {
          let res = document.querySelectorAll(
            `[child-id="RAPID${this.self + name}"]`
          );
          return res[0];
        }
        /**
         * This function retusns instance of the child component if there is one otherwise undefined.
         * REMEMEBER this function will not work before onComponentLoad is run
         * */
        getChildInstance(name) {
          let child = document.querySelectorAll(
            `[child-id="RAPID${this.self + name}"]`
          )[0];
          if (child === void 0) return void 0;
          return getInstance(child);
        }
      };
    }
  });

  // src/md.js
  function parseMd(markdown) {
    markdown = markdown.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
    markdown = markdown.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
    markdown = markdown.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
    markdown = markdown.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    markdown = markdown.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    markdown = markdown.replace(/^# (.*$)/gim, "<h1>$1</h1>");
    markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>");
    markdown = markdown.replace(/__(.*?)__/gim, "<b>$1</b>");
    markdown = markdown.replace(/\*(.*?)\*/gim, "<i>$1</i>");
    markdown = markdown.replace(/_(.*?)_/gim, "<i>$1</i>");
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
    markdown = markdown.replace(/^\s*\n\* (.*)/gim, "<ul>\n<li>$1</li>\n</ul>");
    markdown = markdown.replace(/^\* (.*)/gim, "<li>$1</li>");
    markdown = markdown.replace(/^\s*\n\d\. (.*)/gim, "<ol>\n<li>$1</li>\n</ol>");
    markdown = markdown.replace(/^\d\. (.*)/gim, "<li>$1</li>");
    markdown = markdown.replace(/^\> (.*)/gim, "<blockquote>$1</blockquote>");
    markdown = markdown.replace(/\n$/gim, "<br />");
    return markdown.trim();
  }
  var init_md = __esm({
    "src/md.js"() {
      document.addEventListener("DOMContentLoaded", function() {
        const elements = document.querySelectorAll("[include-md]");
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
    }
  });

  // src/main2.js
  var require_main2 = __commonJS({
    "src/main2.js"(exports, module) {
      init_utils();
      init_Component();
      init_md();
      window.Component = Component;
      var start_prop = "{";
      var end_prop = "}";
      var Template = class {
        constructor() {
          this.className = "";
          this.name = "";
          this.script = null;
          this.html = null;
        }
        /** Adds script to body */
        createScript() {
          if (document.querySelector(`[rapid-script="${this.getClassName()}"]`) == null) {
            let script = document.createElement("script");
            script.setAttribute("rapid-script", this.getClassName());
            script.textContent = this.script.innerHTML;
            document.body.appendChild(script);
          }
        }
        /** returns the classname from the script */
        getClassName(scriptContent) {
          if (this.script == null) return null;
          const classNameMatch = this.script.innerHTML.match(/class\s+([^\s{]+)/);
          if (classNameMatch && classNameMatch.length > 1) {
            return classNameMatch[1];
          } else {
            return null;
          }
        }
      };
      var Comp = class {
        constructor() {
          this.instanceName;
          this.defintion;
          this.props;
          this.html;
        }
        replaceProps() {
          this.html = this.html.replaceAll(
            `${start_prop}children${end_prop}`,
            this.defintion.innerHTML
          );
          for (let prop of Object.entries(this.props)) {
            let key = prop[0];
            let value = prop[1];
            if (key === "child-id") {
              var tempContainer = document.createElement("div");
              tempContainer.innerHTML = this.html;
              var element2 = tempContainer.firstElementChild;
              tempContainer.setAttribute("child-id", value);
              this.html = tempContainer.outerHTML;
            } else {
              this.html = this.html.replaceAll(
                `${start_prop}${key}${end_prop}`,
                value
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
      };
      window.replaceComponents = () => {
        let htmltemplates = document.getElementsByTagName("template");
        let templates = new Object();
        for (let i = htmltemplates.length - 1; i >= 0; i--) {
          let template = new Template();
          template.name = htmltemplates[i].getAttribute("rapid-name");
          template.script = htmltemplates[i].content.querySelector("script");
          if (template.script !== null) {
            template.html = htmltemplates[i].innerHTML.replace(
              template.script.outerHTML,
              ""
            );
            template.createScript();
          } else {
            template.html = htmltemplates[i].innerHTML;
          }
          templates[template.name] = template;
        }
        console.log(templates);
        let components = [];
        for (let [name, template] of Object.entries(templates)) {
          let htmlcomponents = document.getElementsByTagName(name);
          console.log(htmlcomponents);
          for (let i = 0; i < htmlcomponents.length; i++) {
            let component = new Comp();
            component.defintion = htmlcomponents[i];
            let d = document.createElement("div");
            d.innerHTML = template.html;
            component.html = d.outerHTML;
            component.className = template.getClassName();
            component.props = Array.from(htmlcomponents[i].attributes).reduce(
              (acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
              },
              {}
            );
            component.setInstance();
            component.replaceChildId();
            component.replaceProps();
            component.replaceSelf();
            htmlcomponents[i].outerHTML = component.html;
            components.push(component);
            i--;
          }
        }
        for (let i = components.length - 1; i >= 0; i--) {
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
      };
      function includeHTML() {
        const element2 = document.querySelector("[include-html]");
        if (element2 === null) return null;
        const file = element2.getAttribute("include-html");
        if (file) {
          fetch(file).then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.text();
          }).then((html) => {
            element2.outerHTML = html;
            replaceComponents();
            includeHTML();
          }).catch((error) => {
            element2.innerHTML = "Content not found.";
          });
        }
      }
      function rapidRefresh() {
        replaceComponents();
      }
      async function main() {
        includeHTML();
        replaceComponents();
        replaceMd();
        createNoTailwindClass();
      }
      window.getInstanceById = (id) => {
        let el = document.getElementById(id);
        return getInstance(el);
      };
      window.getInstance = (element) => {
        console.log(element);
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
      window.onload = main();
    }
  });
  require_main2();
})();
