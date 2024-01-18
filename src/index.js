
/*
 * we find template look for rapid_name tagname
 * foreach we find we retrive props and add to the
 * component object
 *
 * when the components have been found we want to replace
 * the template code
 *
 * then do we want to run all javascript
 * we do this by going trough all components
 * check their attributes
 * when check inner for js
 * then we do the same for all its childrens
 *
 * */


let start_tag  = "{"
let end_tag    = "}"

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function getElementByUid(uid){
  return document.querySelectorAll(`[rapid-uid="${uid}"]`)[0];

}

function parse(){

  let components = [];
  let templates = document.getElementsByTagName("template");
  for(let i = 0; i < templates.length; i ++){
    let component = templates[i];
    let name = component.getAttribute("rapid-name");
    let this_components = document.getElementsByTagName(name);

    for(let j = 0; j < this_components.length; j ++){

      const element = this_components[j];
      let uid = guidGenerator();
      let copy = component.content.children[1].cloneNode(true);

      copy.setAttribute("rapid-uid",uid);

      let comp = {
        name: name,
        uid: uid,
        props: element.attributes,
        innerHTML:element.innerHTML,
        constructor:component.content.children[0].innerHTML,
        template:copy,
        element:element,
      }
      element.setAttribute("rapid-uid",comp.uid)
      components.push(comp)
      replaceComponents(comp);
      parseJsComponent(comp)

      let el = getElementByUid(comp.uid);
      if(el != null){
        el.outerHTML = comp.new_element.outerHTML
      }
      // j = -1;
      i=-1;
    }
  }
  return components
}

function replaceComponents(components){

    let component = components

    let temuid = component.template.getAttribute("rapid-uid")
    component.element.outerHTML = component.template.outerHTML;

    component.new_element = component.template;

  //return components
}

function getJs(string){
  let js = []
  let reading = "";
  let is_reading = 0;
  for(let i = 0; i < string.length; i++){
    const char = string[i];
    if (char === end_tag) is_reading--;

    if(is_reading > 0){
      reading+=char;
    }
    else if(reading !== ""){
      js.push((' ' + reading).slice(1))
      reading = ""
    }
    if(char === start_tag) is_reading ++;


  }
  return js
}


function replaceAttributeJs(component){

  let props_js = `let props = {}\n`
  for(let i = 0; i < component.props.length; i ++){
    props_js += `props.${component.props[i].name.replace("-","_")} = '${component.props[i].value}'\n`
  }
  for(let i = 0; i < component.new_element.attributes.length; i ++)
  {
    let js = getJs(component.new_element.attributes[i].value)
    for(let j = 0; j < js.length; j++){
      let first = eval(`(\nfunction () {\n${component.constructor}\n${props_js}\n return ${js[j]} \n}\n)()`)

      component.new_element.attributes[i].value =
        component.new_element.attributes[i].value.replace(start_tag+js[j]+end_tag,first)
    }
  }

}

function parseChildrenJs(component){
  let props_js = `let props = {}\n`
  for(let i = 0; i < component.props.length; i ++){
    props_js += `props.${component.props[i].name.replace("-","_")} = '${component.props[i].value}'\n`
  }
  console.log(component.props)
  let js = getJs(component.new_element.innerHTML)
  for(let j = 0; j < js.length; j++){
    let first = eval(`(\nfunction () {\n${component.constructor}\n${props_js}\n return ${js[j]} \n}\n)()`)

    component.new_element.innerHTML =
      component.new_element.innerHTML.replace(start_tag+js[j]+end_tag,first)
  }
}

function parseJsComponent(component){
  parseChildrenJs(component)
  replaceAttributeJs(component)
}

function parseJsComponents(components){
  for(let i = 0; i < components.length; i ++){
    let component = components[i]
    //parseJsComponent(component)
    let el = getElementByUid(component.uid);
    if(el != null){
      el.outerHTML = components[i].new_element.outerHTML
    }
  }
}

let components = parse()
