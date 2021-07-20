function IntegerStressParam(props) {
  return (
    <>
      <div className="columns">
        <div className="column">
          <label>{props.name}:</label>
          <input name={props.paramName} className="input is-small stressPanel" type="text" defaultValue={props.params[props.paramName]} onInput={(e) => {
            props.params[props.paramName] = parseInt(e.target.value);
          }} />
        </div>
      </div>
    </>
  );
}

function DropdownOption(props) {
  return (<option value={props.value}>{props.value}</option>)
}

function DropdownStressParam(props) {
  const options = props.options.map(val => <DropdownOption value={val} key={val}/>)
  return (
    <>
      <div className="columns">
        <div className="column">
          <label>{props.name}:</label>
          <select name={props.paramName} onChange={(e) => {
            props.params[props.paramName] = e.target.value;
          }}>
            {options}
          </select>
        </div>
      </div>
    </>
  )
}

export default function stressPanel(props) {
  return (
    <>
      <div className="column is-one-third mr-2">
        <nav className="panel">
          <p className="panel-heading">
            Stress Parameters
          </p>
          <div className="container" style={{ overflowY: 'scroll', overflowX: 'hidden', height: '350px' }}>
            <IntegerStressParam name="Minimum Workgroups" type="text" paramName="minWorkgroups" params={props.params}/>
            <IntegerStressParam name="Maximum Workgroups" type="text" paramName="maxWorkgroups" params={props.params}/>
            <IntegerStressParam name="Shuffle Percentage" type="text" paramName="shufflePct" params={props.params}/>
            <IntegerStressParam name="Barrier Percentage" type="text" paramName="barrierPct" params={props.params}/>
            <IntegerStressParam name="Test Memory Size" type="text" paramName="testMemorySize" params={props.params}/>
            <IntegerStressParam name="Scratch Memory Size" type="text" paramName="scratchMemorySize" params={props.params}/>
            <IntegerStressParam name="Memory Stride" type="text" paramName="memStride" params={props.params}/>
            <IntegerStressParam name="Memory Stress Percentage" paramName="memStressPct" params={props.params}/>
            <IntegerStressParam name="Memory Stress Iterations" paramName="memStressIterations" params={props.params}/>
            <IntegerStressParam name="Pre-Stress Percentage" paramName="preStressPct" type="text" params={props.params}/>
            <IntegerStressParam name="Pre-Stress Iterations" paramName="preStressIterations" type="text" params={props.params}/>
            <IntegerStressParam name="Stress Line Size" paramName="stressLineSize" type="text" params={props.params}/>
            <IntegerStressParam name="Stress Target Lines" paramName="stressTargetLines" type="text" params={props.params}/>
            <DropdownStressParam name="Stress Assignment Strategy" paramName="stressAssignmentStrategy" params={props.params} options={["round-robin", "chunking"]}/>
          </div>
          <div className="panel-block p-2">
            <button className="button is-link is-outlined is-fullwidth " style={{ width: "200px", marginLeft: "10px" }}>
              Reset all Parameters
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}