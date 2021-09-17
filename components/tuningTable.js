import { reportTime, getCurrentIteration } from '../components/litmus-setup.js'
import PopUp from 'reactjs-popup';
let list =['id', 'minWorkgroupSize','maxWorkgroupSize','maxWorkgroupSize','numMemLocations','numOutputs','memoryAliases','memStressPattern','preStressPattern','stressAssignmentStrategy']
function replacer(key, value) {
  // Filtering out properties
  if ( list.includes(key) ) {
    return undefined;
  }
  return value;
}
function ParamButton(props) {
  return (
    <PopUp className="my-popup" trigger={<button className="button is-info is-small" > Show Param</button>} >
      <div>{JSON.stringify(props.params, replacer).split(",").join('\n').replace(/{|}/g, "")}</div>
    </PopUp>

  )
}

function DynamicRow(props) {
  let time = reportTime();
  let curIter = getCurrentIteration();
  let rate;
  if (time == 0) {
    rate = 0;
  } else {
    rate = Math.round(curIter / time);
  }
  return (
    <tr >
      <td>
        Currently Running
      </td>
      <td>
      </td>
      <td>
        {Math.floor(curIter * 100 / props.pageState.iterations.value)}
      </td>
      <td>
        {rate}
      </td>
      <td>
        {time}
      </td>
      {props.outputs}
    </tr>
  )
}

export function StaticRow(props) {

  return (
    <tr  >
      <td>
        {props.params.id + 1}
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
      {props.config.outputs}
    </tr>
  )
}

export default function TuningTable(props) {
  let dynamicRow = <DynamicRow pageState={props.pageState} outputs={props.dynamicRowOutputs}/>
  return (
    <>
      <div className="table-container">
        <table className="table is-striped ">
          <thead>
            <tr>
              <th>Test Number</th>
              <th>Parameters</th>
              <th>Progress</th>
              <th>Iterations per second</th>
              <th>Time (seconds)</th>
              {props.header}
            </tr>
          </thead>
          {props.pageState.resetTable.value
            ?
            <tbody>
            </tbody>
            :
            <tbody>
              {dynamicRow}
              {props.pageState.tuningRows.value}
            </tbody>
          }
        </table>
      </div>
    </>
  );
}