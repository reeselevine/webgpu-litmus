import { useEffect, useState } from 'react';
import mpCode from '../shaders/message-passing.wgsl'
import { runLitmusTest, reportTime, getCurrentIteration } from '../components/litmus-setup.js'
import { NavItem } from 'react-bootstrap';
function ParamButton(){
    return(
        <button className="button is-info is-small" onClick={()=>{
            alert("here is the button");
         }}>
          Show Param
        </button> 
    )
}
// function BuildRow(props){
//     //console.log(Array.isArray(params))
//     let rows;
//     if(props.params){
//         // rows = props.params.map((param)=>{<BuildButton val ={param}/>})
//        rows = props.params.map((param)=>{<BuildButton val ={param}/>})
//     }
//    return(
//        <>
//        {rows}
//        </>
//    )
// }\
function BuildRow(props){
    return(
        <tr key={props.index+1}>
        <td>
            {props.index+1}
        </td>
        <td>
            <ParamButton></ParamButton>
        </td>
        {/* <td>
            
        </td>
        <td>
            
        </td>
        <td>
            
        </td>
        <td>
            
        </td>
        <td>
            
        </td>
        <td>
            
        </td>
        <td>
            
        </td>
        <td>
            
        </td> */}
        </tr>
    )
}
let rows = [];
function buildTableBody(props){
    for (let i = 0; i< props.pageState.tuningTimes.value; i++){
        rows.push(<BuildRow pageState = {props.pageState} index={i} params={props.params}></BuildRow>)
    }
return rows;
}

export default function tuningTable(props){
    console.log((props.params))
    //reference
    const [params, setParams] = useState(props.params)
    // useEffect(()=>{
    //     setParams(props.params)
    // }, [])
    let rows = buildTableBody(props);
    return (
    <>
     <div className="columns mr-2">
        <div className="column is-two-thirds">
            <div className="columns">
            <table className="table is-striped ">
                <thead>
                <tr>
                    <th>Test Number</th>
                    <th>Parameters</th>
                    <th>Progress</th>
                    <th>Iterations per second</th>
                    <th>Time (seconds)</th>
                    <th>Seq 0 0</th>
                    <th>Seq 0 1</th>
                    <th>Interleavings</th>
                    <th>Weak Behaviors</th>
                </tr>
                </thead>
                <tbody>
                   {rows}
                </tbody>
            </table>
        </div>
        </div>
    </div>
    </>
    );
}