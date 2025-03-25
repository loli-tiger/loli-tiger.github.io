import define1 from "./e93997d5089d7165@2303.js";

function _1(md){return(
md`# \`午餐计算器\``
)}

function _sandwiches(html){return(
html`<input type=range />`
)}

function _total(sandwiches)
{
  let total = sandwiches * 5;
  if (sandwiches > 50) {
    total *= 0.9;
  }
  return total;
}


async function _dog(breed){return(
(await fetch(`https://dog.ceo/api/breed/${breed}/images/random`)).json()
)}

async function _breeds(){return(
(await fetch(`https://dog.ceo/api/breeds/list/all`)).json()
)}

function _breed(select,breeds){return(
select(Object.keys(breeds.message))
)}

function _8(html,dog){return(
html`<img src='${dog.message}' />`
)}

function _alphabet(require){return(
require('@observablehq/alphabet')
)}

function _vegalite(require){return(
require('@observablehq/vega-lite')
)}

function _11(vegalite,alphabet,width){return(
vegalite({
  data: { values: alphabet },
  mark: "bar",
  autosize: "fit",
  width: width, // <- add this line
  encoding: {
    x: {
      field: "letter",
      type: "ordinal"
    },
    y: {
      field: "frequency",
      type: "quantitative"
    }
  }
})
)}

function _promiseExample(){return(
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Promise resolved after 2 seconds!");
  }, 2000);
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof sandwiches")).define("viewof sandwiches", ["html"], _sandwiches);
  main.variable(observer("sandwiches")).define("sandwiches", ["Generators", "viewof sandwiches"], (G, _) => G.input(_));
  main.variable(observer("total")).define("total", ["sandwiches"], _total);
  main.variable(observer("dog")).define("dog", ["breed"], _dog);
  main.variable(observer("breeds")).define("breeds", _breeds);
  const child1 = runtime.module(define1);
  main.import("select", child1);
  main.variable(observer("viewof breed")).define("viewof breed", ["select","breeds"], _breed);
  main.variable(observer("breed")).define("breed", ["Generators", "viewof breed"], (G, _) => G.input(_));
  main.variable(observer()).define(["html","dog"], _8);
  main.variable(observer("alphabet")).define("alphabet", ["require"], _alphabet);
  main.variable(observer("vegalite")).define("vegalite", ["require"], _vegalite);
  main.variable(observer()).define(["vegalite","alphabet","width"], _11);
  main.variable(observer("promiseExample")).define("promiseExample", _promiseExample);
  return main;
}
