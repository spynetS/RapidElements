/*
 * All script tags will be added to the eval
 *
 *
 */


class Component{
  constructor(element) {
    this.element = element;
    this.rapid_uid = this.guidGenerator()
  }
    guidGenerator() {
        var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

}


function logNode(node){
  for(let i = 0; i < node.element.children.length; i ++){
    let component = new Component(node.element.children[i]);
    logNode(component)
  }
}

function main(){

  let root = new Component(document.getRootNode().children[0])


  logNode(root)

}


main()
