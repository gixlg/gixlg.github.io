---
layout: post
title: "I'm a developer, I love automation"
image: images/post-images/automation/automation.gif
excerpt: "Have you ever repeat the same operation over and over? In this blog post, we'll see how to automate some task to extract information from some emails with Google App Script and some APIs."
tags:
  - AppScript
  - Google
  - javascript
  - 🇺🇸
---

In these days a lot of people live in a rented house and I'm one of them.  
Every month I receive an email with attached the fees about gas or electricity power for the apartment where I live, and every time I do these operations:
1. label it with a specific name with the corresponding year and month;
2. save the attachments in a Dropbox folder;
3. insert that information in a Google Drive sheet on a table like the following:  
(The value of fees and rent are fake 😜 )  

<br/>
<img src="{{ site.url }}/images/post-images/automation/SheetExpenses.png" >

I've done these operations several times.  


As all <del>good</del> developer, **I'm lazy**.  


<img src="{{ site.url }}/images/post-images/automation/homer.gif" >


So I asked myself: "Why I have to do the same operation manually every month?   
Can I automate this stuff?".

In the first step, I tried with IFTTT, but is not so powerful to do what I had in mind (or maybe I simply don't know it much 😅️).

After some research, I tried with [Google App Script](https://script.google.com/home).  
Basically, it is a service that allows writing an application in Javascript with the possibility to use Google Service's API like GMail and Drive.

<img style="width: 150px;" src="{{ site.url }}/images/post-images/automation/google-app-script.png" >

Using Google App Script I've done this small experiment:
```javascript
function printMessagesInfo(messages){
  messages.forEach(function(message){
    var from = message.getFrom();
    var date = message.getDate();
    var subject = message.getSubject();
    
    Logger.log('Message subject: "%s" from: %s  date:%s', subject, from, date);
  });
}

function main() {
  var label = GmailApp.getUserLabelByName(configuration.labelNeedToBeProcessed);
  var threads = label.getThreads();
  for (var i = threads.length - 1; i >= 0; i--) { //Process them in the order received
    var thread = threads[i];    
    printMessagesInfo(GmailApp.getMessagesForThread(thread));
  } 
}

```


With these few lines of code **I'm able to search into all my Gmail account for the <del>mails</del> Threads that have a specific label**.  
In order to do that, is necessary to give to the application the access to the Gmail API.




Ok Great! It seems promising.  
Now let's try to do something more useful, like the first task that I mentioned before.

```javascript
function getYearAndMonthStringFromDate(date){  
  if (date.getMonth() == 11) {    
    var nextMonth = new Date(date.getFullYear() + 1, 0, 1); //*2
  } else {
    var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, date.getHours(), date.getMinutes(), 0, 0); //*2
  }
  
  var month = nextMonth.getUTCMonth() + 1; //months from 1-12
  var day = nextMonth.getUTCDate();
  var year = nextMonth.getUTCFullYear();
  
  var stringYear = "" + year;
  var stringMonth = month<10 ? '0'+month : "";
  return stringYear + "-" + stringMonth;
}

function processesThread(thread){
  var messages = GmailApp.getMessagesForThread(thread);
  var message = messages[0];      //In my scenario normally I have only one message for thread for that kind of mail
  var newLabel = "Home staff/"+getYearAndMonthStringFromDate(message.getDate());  //*3
  thread.addLabel(GmailApp.createLabel(newLabel)); 
}

function isThreadAlreadyProcessed(thread){
  return thread.getLabels().some(function(label){ return label.getName() == "Processed by Google Script" }); //*1
}

function main() {
  var label = GmailApp.getUserLabelByName("Need to be processed");
  var threads = label.getThreads();
  for (var i = threads.length - 1; i >= 0; i--) { //Process them in the order received
    var thread = threads[i];   
    
    if (!isThreadAlreadyProcessed(thread)){    
      processesThread(thread);
      thread.addLabel(GmailApp.getUserLabelByName("Processed by Google Script")); //*1
    }
  }  
}

```

A lot of stuff in there, but still pretty simple.  

Let me do just a few comments.  
I added a flag [<sup>1</sup>] (to be precise the label `Processed by Google Script`) that allow identifying if a thread it is been already processed in order to avoid useless elaboration.    
In the function `getYearAndMonthStringFromDate` I did a  month +1 because, for example the fee on January should be paid in February [<sup>2</sup>].  
In the code I create a label like `Home staff/2019-02` to create a hierarchy, so `2019-02` is a sublabel of `Home staff` [<sup>3</sup>].

Well, with this code I'm able to do the **first step of my checklist** 
**<del>1. label it with a specific name with the corresponding year and month.</del>**

Now the goal is to do the second step!
So ideally our code can evolve on this: 

```javascript

function getYearAndMonthStringFromDate(date){  
  ...
}

function processesThread(thread){

  var messages = GmailApp.getMessagesForThread(thread);
  var message = messages[0];      //In my scenario normally I have only one message for thread for that kind of mail
  var yearAndMonth = getYearAndMonthStringFromDate(message.getDate());
  var newLabel = "Casa Gorgonzola/" + yearAndMonth;
  thread.addLabel(GmailApp.createLabel(newLabel)); 


  var attachments = message.getAttachments();
  attachments.forEach(function(fileBlob, index){
    Logger.log('"%s" (%s bytes)', fileBlob.getName(), fileBlob.getSize());    
    uploadAttachmentToDropbox(fileBlob, yearAndMonth, "pdf-"+index);    
  });
}


function uploadAttachmentToDropbox(attachment, date, name){
  var path = "Home staff/" + date + "/"+ date + "-" + name + ".pdf";
  uploadFileToDropbox(attachment, path);
}

function main() {
  ...
}

```
Nothing particular here; the code is pretty straightforward.


To really upload the files on Dropbox, I lean on the amazing Dropbox API and, in particular, I used this one: [file upload](https://www.dropbox.com/developers/documentation/http/documentation#files-upload).

Here's the piece of code that calls the API:

```javascript
function uploadFileToDropbox(file, path) {
  
    var parameters = {
      "path": path,
      "mode": "add",
      "autorename": true,
      "mute": false
    };
    
    //Dropbox Access Token
    var dropboxAccessToken = "***************************************";
    
    var headers = {
      "Content-Type": "application/octet-stream",
      'Authorization': 'Bearer ' + dropboxAccessToken,
      "Dropbox-API-Arg": JSON.stringify(parameters)
    };
      
    var options = {
      "method": "POST",
      "headers": headers,
      "payload": file.getBytes()
    };
    
    var apiUrl = "https://content.dropboxapi.com/2/files/upload";
    var response = JSON.parse(UrlFetchApp.fetch(apiUrl, options).getContentText());
    
    Logger.log("File uploaded successfully to Dropbox in %s", path);
  }
```

Dropbox Access Token can be created from this [page](https://www.dropbox.com/developers/apps) (and it shouldn't be shared).

Now we can delete the second point as well:  
**<del>2. save the attachments in a Dropbox folder</del>**

Ok good, we miss the last level  😀.

At this point, the hard part is not to insert the information in a Google sheet, but rather read the information.  
The file that I receive through email is a pdf, hence is not easy to read it like a normal text file.


<img src="{{ site.url }}/images/post-images/automation/pdf.jpg" >

After some research, I found an amazing script:  [pdfToText](https://stackoverflow.com/a/26623198/5945360).  
That script uses OCR feature, offered by Google, to convert a written document in a text.
To activating this capability, we need to enable the Drive API under  `Resources > Advanced Google Services`.  

<img style="width: 60%;" src="{{ site.url }}/images/post-images/automation/DriveAPI.png" >


Using that, I was able to get from a pdf like this: 

<img style="height: 400px;" src="{{ site.url }}/images/post-images/automation/fattura.png" >

a text like this:
```
""RIEPILOGO BOLLETTA Codice Cliente ********** Codice Fiscale *************************** *** * ** * ****** CONSUMI Totale Energia kWh Elettrica: 70 ••••••...""
```

From that, assuming that the format of the pdf remains stable through the months with some text parsing, we can get all the info that we want.  
In my case, from each invoice, I get the following info:
```javascript
var invoceData = {
  company: "Enegan",
  type: "Energia Elettrica",
  value: 99
}
```

The info from each invoice is combined together and returned by `processesThread`.


```javascript
function processesThread(thread) {
  var messages = GmailApp.getMessagesForThread(thread);
  var message = messages[0];
  var yearAndMonth = getYearAndMonthStringFromDate(message.getDate());
  var newLabel = "Home/" + yearAndMonth;
  thread.addLabel(GmailApp.createLabel(newLabel));

  var result = {
    date: yearAndMonth,
    invoce: []
  };

  var attachments = message.getAttachments();
  attachments.forEach(function (fileBlob, index) {
    Logger.log('"%s" (%s bytes)', fileBlob.getName(), fileBlob.getSize());

    var filetext = pdfToText(fileBlob, { keepTextfile: false });
    var invoceData = getDataFromFileText(filetext);
    result.invoce.push(invoceData);

    uploadAttachmentToDropbox(fileBlob, yearAndMonth, invoceData.company);
  });

  return result;
}


function main() {
  .........
  for (var i = threads.length - 1; i >= 0; i--) { 
    .....
    var result = processesThread(thread);
    uploadInfoToGoogleSheets(result);
    ......
    
  }
}

```

At this point, I have all the data that I need to fill up my sheet.
As before, for taking advantage of the Sheets API, is necessary to give our authorization to the app. 

And this is the final piece of code that I'll show:

```javascript
function uploadInfoToGoogleSheets(input) {  
  var year = parseInt(input.date.substring(0,4));
  var month = parseInt(input.date.substring(5,7));
  fillSheetWithInfo(year, month, input.invoce);
  
}

function getMonthDiffFrom2018_02(year, month) {
    var months = (year - 2018) * 12 + month - 2;
    return months <= 0 ? 0 : months;
}

function getRowToEdit(year, month){
  var firtRowEditable = 3;
  var diff = getMonthDiffFrom2018_02(year, month);
  return firtRowEditable + diff;
}

function fillSheetWithInfo(year, month, invoce){
  var file = SpreadsheetApp.openById(config.googleSheetsFileId);
  Logger.log(file.getName());
  var row = getRowToEdit(year, month);  
  
  var sheet = file.getSheetByName("Foglio1");
  sheet.getRange("B"+row).setValue(year);     //The year
  sheet.getRange("C"+row).setValue(month);    //The number of the moth
  sheet.getRange("D"+row).setFormula(Utilities.formatString('=TEXT(DATE(B%s;C%s;1);"MMMM")',row,row)); //The month name
  sheet.getRange("E"+row).setValue(500);          //The rent
  sheet.getRange("F"+row).setValue(50);       //Condominium fees
  var valueForFormula = invoce.map(function(x) {
    return x.value;
  }).join(";");
  sheet.getRange("G"+row).setFormula('=SUM(' + valueForFormula + ')');  //The sum of fees

  var expenseDetails = invoce.map(function(x) {
    return x.company + "(" + x.type + ")";
  }).join(" + ");
  sheet.getRange("H"+row).setValue(expenseDetails);       //A description of the fees
  sheet.getRange("I"+row).setFormula(Utilities.formatString('=SUM(E%s;F%s;G%s)', row,row,row)); //The total expense

}

```
Here the most difficult thing was to calculate the right row where write the content.  
To do that, I calculate the distance in terms of number of months between the first date in my table (so the 2018-02), to the date of the new entry.  
When the row is known, is possible to write down all the info: the rent, the condominium fees, the total sum, a small description of the type of expense and so on.

Finally, we have automated also the last point.  
**<del>3. insert that information in a sheet on Google Drive formatted like that.</del>**

  

Now I have created a script that can do the operation that I did manually.  
**But still I have to run this script manually!**

So to solve this issue I used a "Trigger"; this allows to execute my function under some condition.
It is possible to set a trigger from [G Suite Developer Hub](https://script.google.com/home/).
In my case was enough to set an execution one time for a month.

And... DONE!!!!  


<img src="{{ site.url }}/images/post-images/automation/done.gif" >
<br/>

## Conclusion
Google App Script gives me a level of freedom that other preconfigured services can't have.
It's a great solution for my use case.
For sure, the ability to write code is what we, as developers, love and it gives the highest degree of flexibility: it's a great plus! 

The part that I didn't like was the "IDE", if we can call it. Writing code on a web page wasn't comfortable at all, compared with VSCode or other tools.  
Another negative part was the impossibility to use source control. It is possible to create different versions of our code but is totally different from what we are used to doing with git, for example.   

These problems can be solved using [CLASP](https://github.com/google/clasp).  
Indeed you can find all the code on my [GitHub Repo](https://github.com/gixlg/GASP-Monthly-House-Fee-Calculator).
   
Maybe I will talk about it in another post. 😁
