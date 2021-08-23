import { reportTime, getCurrentIteration } from '../components/litmus-setup.js'

function ParamButton(props){
    return(
        <button className="button is-info is-small" onClick={()=>{
            alert(JSON.stringify(props.params,null, 4));
            }}>
            Show Param
        </button> 
    )
}
let checkLast;
function lastIteration(iteration){
    checkLast = false
    if(getCurrentIteration() +1 == iteration ){
        checkLast = true
        return checkLast;
    }
    else return checkLast;
}

let percentage = 0; 
let rate = 0;
let time = 0;
let index = 1;
function Percentage(props){
     percentage =Math.floor(getCurrentIteration()*100/props.pageState.iterations.value);
    return(
        <>
        {lastIteration(props.pageState.iterations.value) ? "Done" : `${percentage}%`}
        </>
    )
}
function DynamicRow(props){
    time = reportTime();
    rate = Math.round((getCurrentIteration() / (reportTime())));
    return (
        <tr >
        <td>
            Curr Running 
        </td>
        <td>
        </td>
        <td>
            <Percentage pageState ={props.pageState}></Percentage>
        </td>
        <td>
            {rate}
        </td>
        <td>
            {time}
        </td>
        <td>
            {props.testState.seq0.visibleState}
        </td>
        <td>
            {props.testState.seq1.visibleState}
        </td>
        <td>
            {props.testState.interleaved.visibleState}
        </td>
        <td>
            {props.testState.weak.visibleState}
        </td>
        <td>
            
        </td>
        </tr>
    )
}
function BuildDynamicRow(props){
    
    let jsx = (
        <DynamicRow pageState = {props.pageState} params={props.params} testState={props.testState} ></DynamicRow>
    )

    return jsx
}

 function StaticRow(props){
    
    return(
        <tr  >
        <td>
            {props.params.id+1}
        </td>
        <td>
            <ParamButton params={props.params}></ParamButton>
        </td>
        <td>
            {props.config.progress}
        </td>
        <td>
            {props.config.rate}
        </td>
        <td>
            {props.config.time}
        </td>
        <td>
            {props.config.seq0}
        </td>
        <td>
            {props.config.seq1}
        </td>
        <td>
            {props.config.interleaved}
        </td>
        <td>
            {props.config.weak}
        </td>
        <td>
            
        </td>
        </tr>
    )
     
}

export function BuildStaticRows(props,key){
    // const[staticRows, setStatic] = useState([]);
    let row = <StaticRow pageState = {props.pageState}  key={key} params={props.params} config={props.config}></StaticRow>
   
    return row;
}


export default function tuningTable(props){
    let dynamicRow =  <BuildDynamicRow pageState = {props.pageState} params={props.params} testState={props.testState} ></BuildDynamicRow>
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
                    <th>Interleaved</th>
                    <th>Weak Behaviors</th>
                </tr>
                </thead>
        {props.pageState.resetTable.value 
            ?
                <tbody>
                </tbody>
             :
             <tbody>
                 {dynamicRow}
                 {props.pageState.rows.value}
             </tbody>
        }
               
            </table>
        </div>
        </div>
    </div>
    </>
    );
}