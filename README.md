# RapidElements
RapidElements is a very small library that enables you to easily create compontens with plain html (NO NODE NEEDED).
This library is for you who are tired to use big js frameworks to create a website but want the convinence of components.

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
        <template rapid-name="card" >
            <div class="bg-{color}-500 p-5 rouneded-lg flex flex-col items-center w-[400px] {class}" >
                <h1>Kort</h1>
                <h1>{name}</h1>
                {children}
            </div>
        </template>

        <template rapid-name="bigtitle">
            <div class="text-blue-600" >
                {children}
            </div>
        </template>

        <card name="card1" color="red" class="m-5" >
            <bigtitle  >
                THIS IS THE CHILD
                <p>TJONO</p>
            </bigtitle>
            <h1>TJONO</h1>
        </card>

       <card name="card2" color="blue" class="m-5" ></card>
       <card name="card3" color="green"></card>
       <card name="card4" color="green"></card>

    </body>
</html>
```
- Global components

Components.html
``` html

        <template rapid-name="card" >
            <div class="bg-{color}-500 p-5 rouneded-lg flex flex-col items-center w-[400px] {class}" >
                <h1>Kort</h1>
                <h1>{name}</h1>
                {children}
            </div>
        </template>

        <template rapid-name="bigtitle">
            <div class="text-blue-600" >
                {children}
            </div>
        </template>

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
        <card name="1"></card>
        <card name="2"></card>
        <card name="3"></card>

    </body>
</html>
    
```

**This will only work if the included html is on a server (liveserver inside vscode works).** It will embed the components indide the div conting the `include-html` attribute and then compile the components
This also enables the creation of public component librarys. 

## How it works
RapidElements is just replacing the outerHTML with the component definitions by saving all component definitions (the elements containg rapid-name).
And then everytime we comeacross a element with that tagname replaces the outerHTML with the definition and replacing the props

## TODO
- [ ] Find a way to define components outside the same html (global componts) without developer server
