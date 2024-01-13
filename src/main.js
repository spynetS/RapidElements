const attribute = "component-name"
const component_definition = "component-definition"

function isComponent(element, components){
  for(let i = 0; i < components.length; i ++){
    const componentName = components[i].getAttribute(attribute)
    if(element.tagName.toLowerCase() === componentName){
      return components[i];
    }
  }
  return false;
}

function replaceProps(oldElement, newHtml){

  let childrenString = ""
  for(let i = 0; i < oldElement.children.length; i ++){
    childrenString+= oldElement.children[i].outerHTML;
  }

  newHtml = newHtml.replace("{children}", childrenString)

  let propNames = oldElement.getAttributeNames();
  for(let i = 0; i < propNames.length;i++){
    newHtml = newHtml.replace("{"+propNames[i]+"}",oldElement.getAttribute(propNames[i]))
  }
  return newHtml
}

function codeAddress() {
    var all = document.getElementsByTagName("*");
    var components = [];
    let elementsToChange = []

    // we loop though all elements in the doom looking for component defintions
    // if we find component definitions we add them to the components list
    // we also look for components and if we find one, (has a tag that corosponds)
    // with a component definitnions attribute "component-name") we add a id based
    // on the element to the elementsTo change list and the component definitons.
    // To retrive the element later we change th elements id to the id we added to
    // the elementsToChange list and add a temporary (old_id) to keep track on the real id.
    // We later just do document.getElementById(newId) and we have the element.
    for (var i=0, max=all.length; i < max; i++) {
      let element = all[i];

      if(element.getAttributeNames().includes(attribute)){
        components.push(element);
      }

      let component;
      if(( component = isComponent(element,components)) != false){
        // we set the id tag so we can acces the element with docuemnt.getElementById
        element.setAttribute("old-id",element.id)
        const newId = "component-"+element.tagName+"-"+i;
        element.setAttribute("id",newId)

        elementsToChange.push([newId,component])
      }
    }

  for(let i = 0; i <  elementsToChange.length; i ++){

    // retrive the element we should change
    let element = document.getElementById(elementsToChange[i][0]);
    // we set the id back to what it should be
    let id = element.getAttribute("old-id");
    element.setAttribute("id",id)
    //we retrive the component we will change the element
    let component = elementsToChange[i][1];
    // we change the outherhtml with the otherhtml of the component
    // with its props set
    // wee also set the component_definition to false
    // for the component so the element gets false
    component.setAttribute(component_definition,false)
    element.outerHTML = replaceProps(element,component.outerHTML)
    // we then set it to true so the defintions is true
    component.setAttribute(component_definition,true)
  }

  for(let i = 0; i < all.length; i ++){
    let element = all[i]
    if(element.getAttributeNames().includes(attribute)){
      if(element.getAttribute(component_definition) == "true")
      {
        all[i].style.display="none"
      }
    }
  }
}

window.onload = codeAddress;
