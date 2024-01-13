# RapidElements
RapidElements is a very small library that enables you to easily create compontens with plain html (NO NODE NEEDED).
This library is for you who are tiered to use big js frameworks to create a website but want the convinence of components.

## Installation
To "install" just add the script link
`<script type="text/javascript" src="https://spynets.github.io/RapidElements/src/main.js" >`

## Usage
- Example
```html
<!doctype html>
<html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>Untitled</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">


        <script src="https://cdn.tailwindcss.com"></script>
        <script type="text/javascript" src="https://spynets.github.io/RapidElements/src/main.js" >

        </script>
        <!-- Place favicon.ico in the root directory -->

    </head>
    <body class="flex flex-col gap-2" >
        <h1 component-name="title" component-definition="true" class="text-4xl" >{name}</h1>
        <div component-name="card" class="bg-blue-400 rounded-lg shadow-lg p-5 w-[300px] flex flex-col items-center">
            <h1>This is card with id: {id}</h1>
            ---------
            {children}
        </div>

        <div component-name="person" class="bg-slate-500 p-4 rounded-xl" >
            <h1>{children}</h1>
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
## How it works
RapidElements is just replacing the outerHTML with the component definitions by saving all component definitions (the elements containg component-name).
And then everytime we comeacross a element with that tagname replaces the outerHTML with the definition and replacing the props

## TODO
- [ ] Find a way to define components outside the same html (global componts) without developer server
