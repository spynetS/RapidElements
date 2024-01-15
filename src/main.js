/*
 * Alfred Roos
 * This is a script that enables rapid reusable components.
 * To specify a component use the template tag and set the attribute
 * rapid-name to specify the component name. Then just write the component
 * with the rapid-name as tagname.
 *
 * EXAMPLE
 *      <template rapid-name="card" >
 *          <div class="bg-{color}-500 p-5 rouneded-lg flex flex-col items-center w-[400px] {class}" >
 *              <h1>Kort</h1>
 *              <h1>{name}</h1>
 *              {children}
 *          </div>
 *      </template>

 *      <template rapid-name="bigtitle">
 *          <div class="text-blue-600" >
 *              {children}
 *          </div>
 *      </template>

 *      <card name="alfred" color="red" class="m-5" >
 *          <bigtitle  >
 *              THIS IS THE CHILD
 *              <p>TJONO</p>
 *          </bigtitle>
 *          <h1>TJONO</h1>
 *      </card>
 *      <card name="alfred2" color="blue" class="m-5" ></card>
 *
 * BECOMES
 * <div class="bg-red-500 p-5 rouneded-lg flex flex-col items-center w-[400px] m-5">
 *    <h1>Kort</h1>
 *    <h1>alfred</h1>
 *    <div class="text-blue-600">
 *        THIS IS THE CHILD
 *        <p>TJONO</p>
 *    </div>
 *    <h1>TJONO</h1>
 * </div>
 *
 * <div class="bg-blue-500 p-5 rouneded-lg flex flex-col items-center w-[400px] m-5">
 *     <h1>Kort</h1>
 *     <h1>alfred2</h1>
 * </div>
 */



// this attribute is used to locate componente tagNames
const attribute = "component-name"
const component_definition = "component-definition"
const start_prop = "{"
const end_prop = "}"

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("include-html");
    dev = elmnt.getAttribute("include-dev");
    if(file && dev == 'true'){
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function () {
            if(rawFile.readyState === 4)  {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                console.log(allText);
            }
            }
        }
        rawFile.send(null);    }
    else if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("include-html");
          replaceComponents();
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}

function replaceProps(oldElement, newHtml){

  //replace innerHTML
  let childrenString = ""
  childrenString = oldElement.innerHTML
  newHtml = newHtml.replaceAll(`${start_prop}children${end_prop}`, childrenString)

  //replace all props with the component attriubtes corosponsing with that name
  // <component name="test"/> of <h1>{name}</h1> becomes <h1>test</h1>
  let propNames = oldElement.getAttributeNames();
  for(let i = 0; i < propNames.length;i++){
    newHtml = newHtml.replaceAll(`${start_prop}${propNames[i]}${end_prop}`,oldElement.getAttribute(propNames[i]))
  }
  return newHtml
}

function replaceComponents() {
  let componentDefinitions = []

  // fetch the component definitions
  let templates = document.getElementsByTagName("template");
  for(let i = 0; i < templates.length; i ++){
    let component = templates[i];
    let name = component.getAttribute("rapid-name");
    componentDefinitions.push([name,component.innerHTML])
  }

  let comps = [] // list to hold the components we want to replace and what we want to replace them with
  for(let i = 0; i < componentDefinitions.length; i ++){
    // all the elements with tagname corosponding with a component-definitinos (rapid-name)
    let components = document.getElementsByTagName(componentDefinitions[i][0])
    for(let j = 0; j < components.length; j ++){
      components[j].outerHTML = (replaceProps(components[j],componentDefinitions[i][1]))
      console.log(document.body.outerHTML)
      j--; // we go back a step because we have to (i don't really know but it somehow also makes sense -_ö_-)
    }
  }

}

function main(){
  //try to include html
  includeHTML();
  replaceComponents()
}

window.onload = main();
