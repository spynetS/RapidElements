# RapidElements
RapidElements is a very small library that enables you to easily create compontens with plain html (NO NODE NEEDED).
This library is for you who are tiered to use big js frameworks to create a website but want the convinence of components.

## Installation
To "install" just add the script link
`<script defer type="text/javascript" src="https://spynets.github.io/RapidElements/src/main.js" >`

## Usage
- Example
```html
<!doctype html>
<html class="no-js" lang="">
    <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script defer type="text/javascript" src="https://spynets.github.io/RapidElements/src/main.js" ></script>

    </head>
    <body class="flex flex-col gap-2" >
        <div component-name="card" class="bg-blue-400 rounded-lg shadow-lg p-5 w-[300px] flex flex-col items-center">
            <h1>This is card with id: {id}</h1>
            ---------
            {children}
        </div>

        <div component-name="child" class="bg-red-500 p-5" >
            {children}
        </div>

        <card id="0" name="alfred" color="blue">
            <child>
                <card id="0.5">
                    <h1>hej</h1>
                </card>
            </child>
        </card>
        <card id="1"></card>
        <card id="2"></card>
        <card id="3"></card>

    </body>
</html>
```
- Global components

Components.html
``` html
    <div component-name="card" class="bg-blue-400 rounded-lg shadow-lg p-5 w-[300px] flex flex-col items-center">
        <h1>This is card with id: {id}</h1>
        ---------
        {children}
    </div>
        
    <div component-name="child" class="bg-red-500 p-5" >
        {children}
    </div>

```

index.html
``` html
<!doctype html>
<html class="no-js" lang="">
    <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script defer type="text/javascript" src="https://spynets.github.io/RapidElements/src/main.js" ></script>

    </head>
    <body class="flex flex-col gap-2" >
        <div include-html="Components.html" ></div>

        <card id="0" name="alfred" color="blue">
            <child>
                <card id="0.5">
                    <h1>hej</h1>
                </card>
            </child>
        </card>
        <card id="1"></card>
        <card id="2"></card>
        <card id="3"></card>

    </body>
</html>
    
```

**This will only work on a server. It will embed the components indide the div conting the `include-html` attribute and then compile the components**
This also enables the creation of public component librarys. 
## How it works
RapidElements is just replacing the outerHTML with the component definitions by saving all component definitions (the elements containg component-name).
And then everytime we comeacross a element with that tagname replaces the outerHTML with the definition and replacing the props

## TODO
- [ ] Find a way to define components outside the same html (global componts) without developer server
