let hookStates: any[] = [];
let hookIndex = 0;

export function useState(initialValue: any) {
  const currentIndex = hookIndex;
  
  if (hookStates[currentIndex] === undefined) {
    hookStates[currentIndex] = initialValue;
  }

  const setState = (newValue: any) => {
			hookStates[currentIndex] = newValue;
			window.update();
 //   reRender(); // triggers component re-render
  };

  hookIndex++;
  return [hookStates[currentIndex], setState];
}
