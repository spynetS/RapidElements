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
    for (let i2 = 0; i2 < length; i2++) {
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
          this.className = "Component";
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
        copyAttributes(target, source) {
          Array.from(source.attributes).forEach((attr) => {
            target.setAttribute(attr.name, attr.value);
          });
        }
        rerender() {
          let comp = new Comp();
          comp.html = this.template;
          comp.className = this.className;
          comp.props = this.props;
          comp.instanceName = this.self;
          comp.replaceChildId();
          comp.replaceProps();
          comp.replaceSelf();
          comp.html = replaceJs(comp.html);
          let div = document.querySelectorAll(`[instance="${this.self}"]`)[0];
          console.log(comp.html);
          var doc = new DOMParser().parseFromString(comp.html, "text/html");
          console.log("elements");
          for (let i2 = 0; i2 < doc.body.children.length; i2++) {
            div.children[i2].innerHTML = doc.body.children[i2].innerHTML;
            this.copyAttributes(div.children[i2], doc.body.children[i2]);
          }
        }
      };
    }
  });

  // src/md.js
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
    markdown = markdown.replace(/^\s*######\s+(.*)$/gim, "<h6>$1</h6>");
    markdown = markdown.replace(/^\s*#####\s+(.*)$/gim, "<h5>$1</h5>");
    markdown = markdown.replace(/^\s*####\s+(.*)$/gim, "<h4>$1</h4>");
    markdown = markdown.replace(/^\s*###\s+(.*)$/gim, "<h3>$1</h3>");
    markdown = markdown.replace(/^\s*##\s+(.*)$/gim, "<h2>$1</h2>");
    markdown = markdown.replace(/^\s*#\s+(.*)$/gim, "<h1>$1</h1>");
    markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>");
    markdown = markdown.replace(/__(.*?)__/gim, "<b>$1</b>");
    markdown = markdown.replace(/\*(.*?)\*/gim, "<i>$1</i>");
    markdown = markdown.replace(/_(.*?)_/gim, "<i>$1</i>");
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
    markdown = markdown.replace(/^\s*\* (.*)/gim, "<ul>\n<li>$1</li>\n</ul>");
    markdown = markdown.replace(/^\s*\n\*\s+(.*)/gim, "<ul>\n<li>$1</li>\n</ul>");
    markdown = markdown.replace(
      /^\s*\d+\.\s+(.*)/gim,
      "<ol>\n<li>$1</li>\n</ol>"
    );
    markdown = markdown.replace(
      /^\s*\n\d+\.\s+(.*)/gim,
      "<ol>\n<li>$1</li>\n</ol>"
    );
    markdown = markdown.replace(
      /^\s*\>\s+(.*)/gim,
      "<blockquote>$1</blockquote>"
    );
    markdown = markdown.replace(/\n$/gim, "<br />");
    return markdown.trim();
  }
  function replaceMd() {
    let markdowns = document.querySelectorAll("[markdown]");
    for (let i2 = 0; i2 < markdowns.length; i2++) {
      let elmnt = markdowns[i2];
      let to_convert = elmnt.innerHTML;
      elmnt.classList.add("no-tailwind");
      let converted = parseMd(to_convert);
      elmnt.innerHTML = converted;
    }
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
      var start_js = "{{";
      var end_js = "}}";
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
      var Comp2 = class {
        constructor() {
          this.instanceName;
          this.defintion;
          this.props;
          this.html;
          this.template = "";
        }
        replaceProps() {
          try {
            this.props.children = this.defintion.innerHTML;
          } catch (exception) {
            console.log(exception);
          }
          try {
            this.html = this.html.replaceAll(
              `${start_prop}children${end_prop}`,
              this.defintion.innerHTML
            );
          } catch (exception) {
            console.log(exception);
          }
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
          for (let i2 = 0; i2 < childElement.length; i2++) {
            const was = childElement[i2].getAttribute("child-id");
            if (!was.includes("RAPID")) {
              childElement[i2].setAttribute("child-id", "RAPIDself" + was);
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
        for (let i2 = htmltemplates.length - 1; i2 >= 0; i2--) {
          let template = new Template();
          template.name = htmltemplates[i2].getAttribute("rapid-name");
          template.script = htmltemplates[i2].content.querySelector("script");
          if (template.script !== null) {
            template.html = htmltemplates[i2].innerHTML.replace(
              template.script.outerHTML,
              ""
            );
            template.createScript();
          } else {
            template.html = htmltemplates[i2].innerHTML;
          }
          templates[template.name] = template;
        }
        let components = [];
        for (let [name, template] of Object.entries(templates)) {
          let htmlcomponents = document.getElementsByTagName(name);
          console.log(htmlcomponents);
          for (let i2 = 0; i2 < htmlcomponents.length; i2++) {
            let component = new Comp2();
            component.defintion = htmlcomponents[i2];
            let d = document.createElement("div");
            d.innerHTML = template.html;
            component.html = d.outerHTML;
            component.template = d.innerHTML;
            component.className = template.getClassName();
            component.props = Array.from(htmlcomponents[i2].attributes).reduce(
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
            htmlcomponents[i2].outerHTML = component.html;
            components.push(component);
            i2--;
          }
        }
        for (let i2 = components.length - 1; i2 >= 0; i2--) {
          let component = components[i2];
          if (component.className != null) {
            let js2 = `let ${component.instanceName} = new ${component.className}();`;
            js2 += `${component.instanceName}.self = '${component.instanceName}';`;
            js2 += `${component.instanceName}.props = ${JSON.stringify(component.props)};`;
            js2 += `${component.instanceName}.onComponentLoad();`;
            js2 += `${component.instanceName}.template = '${component.template.replaceAll("\n", "")}';`;
            js2 += `${component.instanceName}.className = '${component.className}';`;
            let script = document.createElement("script");
            script.textContent = js2;
            document.body.appendChild(script);
          }
        }
        document.documentElement.innerHTML = replaceJs(
          document.documentElement.innerHTML
        );
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
          }).then((html2) => {
            element2.outerHTML = html2;
            replaceComponents();
            includeHTML();
          }).catch((error) => {
            element2.innerHTML = "Content not found.";
          });
        }
      }
      window.rapidRefresh = () => {
        replaceComponents();
      };
      function main() {
        includeHTML();
        replaceComponents();
        replaceMd();
        createNoTailwindClass();
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
      window.replaceMd = replaceMd;
      window.Comp = Comp2;
    }
  });
  require_main2();
})();
