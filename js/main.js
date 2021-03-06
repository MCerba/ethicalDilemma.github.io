/** Teaches IE < 9 to recognize HTML5 elements. */
"use strict"
var wiki = {};
var regex = {
  isLikeDate: /^\d\d\d\d-\d*\d-\d*\d$/,
  isUnecpectedArticle: /^Special:.*/
};

if (!document.footer) {
  createDummyElements();
}
function createDummyElements() {
  var semanticElements = [
    "article", "aside", "details", "figcaption", "figure",
    "footer", "header", "hgroup", "menu", "nav", "section"
  ];
  for (var i = 0; i < semanticElements.length; i++) {
    document.createElement(semanticElements[i]);
  }
}

function getTarget(e) {
  var evn = e || window.event;
  return evn.srcElement || e.target;
}

/**
 *this function make target tab visible and change current tub navigation style
 * @param {1} event
 */
function tabswap (e) {
  console.log(getTarget(e));
  if (getTarget(e).getAttribute("id") === "topTab") {
    getTarget(e).setAttribute("class", "on" );
    wiki.tab2.setAttribute("class", "off" );
    wiki.tab3.setAttribute("class", "off" );
    wiki.topSection.style.visibility = "visible";
    wiki.savedSection.style.visibility = "hidden";
    wiki.activitySection.style.visibility = "hidden";
  }
  if (getTarget(e).getAttribute("id") === "savedTab") {
    getTarget(e).setAttribute("class", "on" );
    wiki.tab1.setAttribute("class", "off" );
    wiki.tab3.setAttribute("class", "off" );
    wiki.topSection.style.visibility = "hidden";
    wiki.savedSection.style.visibility = "visible";
    wiki.activitySection.style.visibility = "hidden";
  }
  if (getTarget(e).getAttribute("id") === "activityTab") {
    getTarget(e).setAttribute("class", "on" );
    wiki.tab1.setAttribute("class", "off" );
    wiki.tab2.setAttribute("class", "off" );
    wiki.topSection.style.visibility = "hidden";
    wiki.savedSection.style.visibility = "hidden";
    wiki.activitySection.style.visibility = "visible";
  }
}

function sendRequest(url, callback, paramForCallback) {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  U.addHandler(req, "load", function() {
    console.log(req.status);
    if (req.status < 400) {
      callback(req.responseText, paramForCallback);
    }
  });
  req.send(null);
}



function getValidDate(date) {
  // optional
  var pass = true;
  console.log(date);
  if (date === undefined) {
    return false;
  }
  if (regex.isLikeDate.test(date)) {
    // parse into an array of numbers
    var values = date.split("-").map(function (i) {
      return parseInt(i);
    });
    // use Date object to check that values correspond to an existing date (e.g. not 30/02/2000)
    // note that Date ctor expects a 0-based index for month (e.g. March is 2)
    var dateObject = new Date(values[0], values[1] - 1, values[2]);
    // when you create a Date object with weird value like "14th month", the adjacent value
    // is adjusted, so we would get back different data for date, month and year than what is
    // in values if that's the case.
    console.log(values[0] + "/" + values[1] + "/" + values[2]);

    if (dateObject.getDate() !== values[2]) {
      pass = false;
    }
    if (dateObject.getMonth() !== values[1] - 1) {
      pass = false;
    }
    if (dateObject.getFullYear() !== values[0]) {
      pass = false;
    }
    if (values[0] < 2015 ) {
      pass = false;
    }
    if (values[0] === 2015 && values[1] < 7){
      pass = false;
    }
    var today = new Date();
    var yesterday =  new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    console.log(yesterday);
    console.log(dateObject);
    if (dateObject > yesterday){
      pass = false;
    }


    return pass;
  }
}

function getValidLanguage(language) {
  // optional
  if (language === undefined) {
    return false;
  }
  var choices = ["English", "French"];
  if (choices.indexOf(language) >= 0) {
    return true;
  }
}

function getValidNumberOfArticles(number) {
  // optional
  if (number === undefined) {
    return false;
  }
  var choices = ["5", "10", "20"];
  if (choices.indexOf(number) >= 0) {
    return true;
  }
}

function getValue(id) {
  var field = document.getElementById(id);
  if (field && field.value) {
    return field.value;
  }
}

//return Yesturday Date in string format yyyy-mm-dd
function yesterday() {
  var today = new Date();
  var yesterday =  today.setDate(today.getDate() - 1);
  var dd = today.getDate();
  //January is 0!
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();

  if(dd < 10) {
    dd = "0" + dd
  }

  if(mm < 10) {
    mm = "0" + mm
  }

  yesterday = yyyy + "-" + mm + "-" + dd;
  return yesterday;
}
//display mesage and Insrt msg in DOM
function displayMsg(msg) {
  var err = document.getElementById("errorContainer");
  while (err.firstChild) {
    err.removeChild(err.firstChild);
  }
  var p = document.createElement("p");
  p.textContent = msg;
  err.appendChild(p);
}



//validate all form Data
function validateAllData(displayMsg){
  var allDataIsValid = true;
  if (!getValidDate(getValue("searchingDate"))){
    allDataIsValid = false;
    displayMsg("Searching Date is invalid! " +
    " The date should be between 2015-06-01 and " + yesterday());
  }
  if (!getValidLanguage(getValue("language"))){
    allDataIsValid = false;
    displayMsg("Language should be English or French!");
  }
  if (!getValidNumberOfArticles(getValue("numberOfarticles"))){
    allDataIsValid = false;
    displayMsg("Number Of Articles should be 5, 10 or 20!");
  }
  if (allDataIsValid){
    displayMsg("");
    console.log("All valid!!!!!");
  }

  return allDataIsValid;
}

function requestPreprocessing() {
  if (!validateAllData(displayMsg)) {
    return;
  }
  var baseURL = "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/"
  var values = getValue("searchingDate").split("-").map(function (i) {
    return parseInt(i);
  });
  if(values[1] < 10) {
    values[1] = "0" + values[1]
  }

  if(values[2] < 10) {
    values[2] = "0" + values[2]
  }
  var formatDate = values[0] + "/" + values[1] + "/" + values[2];
  if (getValue("language") === "English"){
    baseURL = baseURL + "en.wikipedia.org/all-access/" + formatDate;
  } else {
    baseURL = baseURL + "fr.wikipedia.org/all-access/" + formatDate;
  }
  sendRequest(baseURL, displayResults);
  console.log(baseURL);


}
/**
 * This function validate article.
 * @param {article}  - article in JSON format
 * @returns {boolean}  - false  if article title is "Main_Page" or starts from "Special:"
 */
function validateAritcle(article) {
  if (article.article === "Main_Page"  ||
  regex.isUnecpectedArticle.test(article.article)){
    return false;
  } else {
    return true;
  }
}

/**
 * This function display article.
 * @param {article}  - article in JSON format
 */
function displayArticle(article, nunberOfVisits){
  console.log(article);
  var currentArticle = document.createElement("article");
  currentArticle.setAttribute("id", "currentArticle" );
  var articleJson = JSON.parse(article);

  var extract = document.createElement("p");
  extract.textContent = articleJson.extract;

  var visites = document.createElement("p");
  visites.textContent = "NUMBER OF VISITES: " + nunberOfVisits;
  visites.setAttribute("id", "visites");

  var img = document.createElement("img");
  img.setAttribute("width", articleJson.thumbnail.width / 2 );
  img.setAttribute("src", articleJson.thumbnail.source );
  img.setAttribute("alt", articleJson.title );

  var title = document.createElement("a");
  title.textContent = articleJson.title;
  title.setAttribute("href", articleJson.content_urls.desktop.page );
  title.setAttribute("id", "articleTitle" );

  currentArticle.appendChild(img);
  currentArticle.appendChild(title);
  currentArticle.appendChild(visites);
  currentArticle.appendChild(extract);
  wiki.topResultsSection.appendChild(currentArticle);

}


function displayResults(content){
  var topArticlesJson = JSON.parse(content);
  console.log(topArticlesJson.items[0].articles[0]);
  wiki.articlesToDisplay = [];
  var count = 0;
  while (wiki.articlesToDisplay.length < getValue("numberOfarticles")){
    if (validateAritcle(topArticlesJson.items[0].articles[count])){
      wiki.articlesToDisplay.push(topArticlesJson.items[0].articles[count])
    }
    count++;
    if (count === 999){
      break;
    }

  }
  wiki.articlesToDisplay.forEach(function(item) {
    var urlBase = "https://en.wikipedia.org/api/rest_v1/page/summary/";
    sendRequest(urlBase + item.article + "?redirect=false", displayArticle, item.views);


  })

}

/**
 * Running ofter DOM was loaded
 */
U.ready(function() {
  console.log("ready");
  wiki.tab1 = document.getElementById("topTab");
  wiki.tab2 = document.getElementById("savedTab");
  wiki.tab3 = document.getElementById("activityTab");
  wiki.topSection = document.getElementById("top");
  wiki.savedSection = document.getElementById("saved");
  wiki.activitySection = document.getElementById("activity");
  wiki.topResultsSection = document.getElementById("topResults");

  wiki.ul = document.getElementById("navul");
  wiki.showBtn = document.getElementById("submitBtn");
  wiki.saveBtn = document.getElementById("saveBtn");



  U.addHandler(wiki.ul, "click", tabswap);
  U.addHandler(wiki.showBtn, "click", function(e){
    requestPreprocessing(e);
    e.preventDefault();
  });

  //U.addHandler(gallery.container, "dblclick", flip);
});
