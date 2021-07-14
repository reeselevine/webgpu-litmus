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
    <div className="columns">
      <div className="column">
        <h1 className="testName">Message Passing</h1>
          <h2 className="testDescription">Description goes here</h2>
      </div>
    </div>
    <div className=" columns">
    <div className=" column">
      <div className="  columns is-one-fifth">
        <div className="column">
          Starting value
        </div>
      </div>
      <div className=" columns">
        <div className="column">
          <div className="columns">
            <div className="column">
              <div className="tabs is-medium is-centered">
                <ul>
                  <li className={pesudoActive} onClick={()=>{setPesudoActive("is-active"); setSourceActive(""); setSource("is-hidden");setPesudo(""); }}><a>Pesudo-Code</a></li>
                  <li className={sourceActive} onClick={()=>{setPesudoActive(""); setSourceActive("is-active"); setSource(""); setPesudo("is-hidden"); }}><a>Source Code</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="columns">
            <div className="column">
              <div className="px-2" id="tab-content">
                <div id="pesudoCode" className={pesudoSwitch}>
                  <p>here is goes the pesudo code</p>
                </div>
                <div id="sourceCode" className={sourceSwitch}>
                  <p>here goes the source code</p>
                </div>
              </div>
            </div>          
          </div>
        </div>
        
        {/* <div className="column">
          T1
        </div>
        <div className="column">
          T2
        </div>
        <div className="column">
          T3
        </div>
        <div className="column">
          T4
        </div> */}
      </div>
      <div className="columns is-one-fifth">
        <div className="column">
          result
        </div>
      </div>
    </div>
    <div className="column is-one-third mr-2">
      <nav className="panel">
        <p className="panel-heading">
          Stress Parameters
        </p>
        <p className="control">
          <div className="columns p-2">
            <div className="column is-one-third">
            <span>Param 1</span>
            </div>
            <div className="column">
              <input className="input is-small" type="text" placeholder="Parameter 1"/>
            </div>
          </div>
        </p>
        <p className="control">
          <div className="columns p-2">
            <div className="column is-one-third">
            <span>Param 2</span>
            </div>
            <div className="column">
              <input className="input is-small" type="text" placeholder="Parameter 2"/>
            </div>
          </div>
        </p>
        <p className="control">
          <div className="columns p-2">
            <div className="column is-one-third">
            <span>Param 3</span>
            </div>
            <div className="column">
              <input className="input is-small" type="text" placeholder="Parameter 3"/>
            </div>
          </div>
        </p>
        <div className="panel-block">
          <button className="button is-link is-outlined is-fullwidth">
            Reset all Paramters
          </button>
        </div>
      </nav>
    </div>
  </div>
  <div className="columns">
    <div className="column is-one-fifth">
    <p className="control">
      <input className="input" type="text" placeholder="Iterations" onInput={(e) => {
        setiteration(e.target.value);
      }}/>
    </p>
    <div className="buttons mt-2">
      <button className="button is-primary" onClick={()=>{
        doMessagePassing(iteration);
      }} disabled={iteration<0}>Start Test</button>
    </div>
    </div>
    <div className="column">
     {loading ?  (<ReactBootStrap.Spinner animation="border" />):(<><p> {result}</p></>) }
     {/* <p> {result}</p> */}
    </div>
  </div>
</>
    );
}