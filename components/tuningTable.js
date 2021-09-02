import { reportTime, getCurrentIteration } from '../components/litmus-setup.js'

function PopUp(props) {
  return (
    <div class="modal">
      <div class="modal-background"></div>
      <div class="modal-content">
        {JSON.stringify(props.params, null, 4)}
      </div>
      <button class="modal-close is-large" aria-label="close"></button>
    </div>
  )
}
function ParamButton(props) {
  return (
    <button className="button is-info is-small" onClick={() => {
      alert(JSON.stringify(props.params, null, 4))
    }}>
      Show Param
    </button>
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

export default function TuningTable(props) {
  let dynamicRow = <DynamicRow pageState={props.pageState} testState={props.testState}/>
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
              <th className="sequentialTH">{props.testState.seq0.label}</th>
              <th className="sequentialTH">{props.testState.seq1.label}</th>
              <th className="interleavedTH">{props.testState.interleaved.label}</th>
              <th className="weakTH">{props.testState.weak.label}</th>
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