---
layout: post
title: "You don't know DevTool"
image: images/post-images/you-don-t-know-chrome/chrome-is-the-best.jpg
tags:
  - DevTool
  - javascript
  - 🇺🇸
---
How cool is chrome?
From my point of view is the best browser actually on the scene.  
It is **simple** and **estensible**.

Chrome doesn't offer only a very nice browser but also an amazing Development Tool, the **DevTool**.  
DevTool, is powerful and full of features, if you are a web developer or have a bit of experience on that field you would agree with me.

In this article (and I hope to show more tricks on next posts), I will show some nice features that maybe **you don't know** about **DevTool**.  
Let's start from the basic. What is the function that you use most in chrome?

I bet **console.log**.  

<img id="you-got-it" src="{{ site.url }}/images/post-images/you-don-t-know-chrome/you-got-it.jpg" >


I use it every time during the debug phase; is one of the most used and one of the most abused (but this is not the point now).

Console.log is more powerful that I thought.  
I didn't know that it's **similar to** *printf* **from c**.  
So, in a few words, the first argument is the string that is printed, but if it's used some special character, they are replaced by the other argument of the method.

E.g
```javascript
console.log("An example is more %s than %i words", "clear", 1000);
```
will print out:

```log
"An example is more clear than 1000 words".
```

Lots of times if I wrote something like this: 
```javascript
var object = {data: "My data"};
console.log("I received this object: " + object);
```
and I get this 
```log
I received this object [object Object]
```
and I could not see the value of the object.  
So at the beginning I split che console log above in two separate calls.

Not so nice, right?!

This is a better way:
```javascript
var object = {data: "My data"}
console.log("I received this object %o" , object)
```
and then it's possible to see the text and the content of the object.
```log
I received this object {data: "My data"}
```

If the object is a **DOM element**, it's possible to choose if we want to see the **DOM representation** or the **object representation.**

E.g. 


```javascript
var domElement = document.querySelector("#you-got-it");
console.log("The domElement can be show like this %o ...", domElement);
console.log("... or like this %O ...", domElement);
```
Note: feel free to open the console on this page and run this code  :) 

<br/>
<br/>


For closing this quick journey on console log features, I'll show you a fun thing.

Do you know that you can style the console log output?

Yessss! It is possible!

<img src="{{ site.url }}/images/post-images/you-don-t-know-chrome/i-can-style-everything.jpg" >



With **%c** follow by a valid **CSS** syntax is possible to get a more original output into the console.  
Let's try it!

```javascript
console.log('%cLook how Amazing I am', 
            'background: #222; color: yellow; font-size: 50px; margin: 20px; padding: 30px');
```

After this you can see something like this.

<br/>
<img src="{{ site.url }}/images/post-images/you-don-t-know-chrome/style-console-log.png" alt="style console log">
<br/>

It is awesome, but **it's just a nerd thing**, to be honest I've never used it in a real project.

So, that's all guys. If you find something that you did't know or just like it, watch this space.

PS. All this methods are also valid for console.error, console.warn.
