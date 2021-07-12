import Link from 'next/link'
import React,{ useState } from 'react';
//import Script from 'next/script';
import Layout from '../../components/layout';
import * as ReactBootStrap from 'react-bootstrap';
const results = [];
export default function StoreBuffer() {
  const [iteration, setiteration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pesudoSwitch, setPesudo]=useState("");
  const [sourceSwitch, setSource]=useState("is-hidden");
  const [pesudoActive, setPesudoActive]=useState("is-active");
  const [sourceActive, setSourceActive]=useState("");
  
  async function doMessagePassing(num) {
    setLoading(true);
    let sum = 1;
   for(let i = 0; i < num; i ++){
     sum +=sum * i;
   }
   console.log("this is result "+sum);
   setTimeout(() => {
    setLoading(false);
   }, 3000);
   setResult(sum);
   return sum;
  }
  // try {
  //   const p = doMessagePassing(iteration);
  //   if (p instanceof Promise) {
  //     p.catch((err) => {
  //       console.error(err);
  //       setError(err);
  //     });
  //   }
  // } catch (err) {
  //   console.error(err);
  //   setError(err);
  // }
  return (
  <>
    <div class="columns">
      <div class="column">
        <h1 class="testName">Message Passing</h1>
          <h2 class="testDescription">Description goes here</h2>
      </div>
    </div>
    <div class=" columns">
    <div class=" column">
      <div class="  columns is-one-fifth">
        <div class="column">
          Starting value
        </div>
      </div>
      <div class=" columns">
        <div class="column">
          <div class="columns">
            <div class="column">
              <div class="tabs is-medium is-centered">
                <ul>
                  <li class={pesudoActive} onClick={()=>{setPesudoActive("is-active"); setSourceActive(""); setSource("is-hidden");setPesudo(""); }}><a>Pesudo-Code</a></li>
                  <li class={sourceActive} onClick={()=>{setPesudoActive(""); setSourceActive("is-active"); setSource(""); setPesudo("is-hidden"); }}><a>Source Code</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <div class="px-2" id="tab-content">
                <div id="pesudoCode" class={pesudoSwitch}>
                  <p>here is goes the pesudo code</p>
                </div>
                <div id="sourceCode" class={sourceSwitch}>
                  <p>here goes the source code</p>
                </div>
              </div>
            </div>          
          </div>
        </div>
        
        {/* <div class="column">
          T1
        </div>
        <div class="column">
          T2
        </div>
        <div class="column">
          T3
        </div>
        <div class="column">
          T4
        </div> */}
      </div>
      <div class="columns is-one-fifth">
        <div class="column">
          result
        </div>
      </div>
    </div>
    <div class="column is-one-third mr-2">
      <nav class="panel">
        <p class="panel-heading">
          Stress Parameters
        </p>
        <p class="control">
          <div class="columns p-2">
            <div class="column is-one-third">
            <span>Param 1</span>
            </div>
            <div class="column">
              <input class="input is-small" type="text" placeholder="Parameter 1"/>
            </div>
          </div>
        </p>
        <p class="control">
          <div class="columns p-2">
            <div class="column is-one-third">
            <span>Param 2</span>
            </div>
            <div class="column">
              <input class="input is-small" type="text" placeholder="Parameter 2"/>
            </div>
          </div>
        </p>
        <p class="control">
          <div class="columns p-2">
            <div class="column is-one-third">
            <span>Param 3</span>
            </div>
            <div class="column">
              <input class="input is-small" type="text" placeholder="Parameter 3"/>
            </div>
          </div>
        </p>
        <div class="panel-block">
          <button class="button is-link is-outlined is-fullwidth">
            Reset all Paramters
          </button>
        </div>
      </nav>
    </div>
  </div>
  <div class="columns">
    <div class="column is-one-fifth">
    <p class="control">
      <input class="input" type="text" placeholder="Iterations" onInput={(e) => {
        setiteration(e.target.value);
      }}/>
    </p>
    <div class="buttons mt-2">
      <button class="button is-primary" onClick={()=>{
        doMessagePassing(iteration);
      }} disabled={iteration<0}>Start Test</button>
    </div>
    </div>
    <div class="column">
     {loading ?  (<ReactBootStrap.Spinner animation="border" />):(<><p> {result}</p></>) }
     {/* <p> {result}</p> */}
    </div>
  </div>
</>
    );
}