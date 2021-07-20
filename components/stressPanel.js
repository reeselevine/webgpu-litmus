import ReactTooltip from 'react-tooltip';

function IntegerStressParam(props) {
  return (
    <>
      <div className="columns">
        <div className="column">
          <label data-tip={props.description}>{props.name}:</label>
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

function stressPatternOnChange(params, paramName) {
  return function onChange(e) {
    switch(e.target.value) {
      case "store-store":
        params[paramName] = 0;
        break;
      case "store-load":
        params[paramName] = 1;
        break;
      case "load-store":
        params[paramName] = 2;
        break;
      case "load-load":
        params[paramName] = 3;
        break;
      default:
        console.log("Unexpected value");
    }
  }
}

function stressAssignmentStrategyOnChange(params, paramName) {
  return function onChange(e) {
    params[paramName] = e.target.value;
  }
}

function DropdownStressParam(props) {
  const options = props.options.map(val => <DropdownOption value={val} key={val}/>)
  return (
    <>
      <div className="columns">
        <div className="column">
          <label data-tip={props.description}>{props.name}:</label>
          <select className="stressPanelDropdown" name={props.paramName} onChange={props.updateFunc(props.params, props.paramName)}>
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
        <ReactTooltip backgroundColor="black"/>
        <nav className="panel">
          <p className="panel-heading">
            Test Parameters
          </p>
          <div className="container" style={{ overflowY: 'scroll', overflowX: 'hidden', height: '350px' }}>
            <IntegerStressParam name="Minimum Workgroups" description="Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)" paramName="minWorkgroups" params={props.params}/>
            <IntegerStressParam name="Maximum Workgroups" description="Each stress iteration is launched with a random number of workgroups between Minimum Workgroups and Maximum Workgroups (values should be between 4 and 1024)" paramName="maxWorkgroups" params={props.params}/>
            <IntegerStressParam name="Shuffle Percentage" description="The percentage of iterations that the workgroup ids are randomly shuffled (values should be between 0 and 100)" paramName="shufflePct" params={props.params}/>
            <IntegerStressParam name="Barrier Percentage" description="The percentage of iterations where the testing workgroups attempt to synchronize before executing their part of the litmus test (values should be between 0 and 100)" paramName="barrierPct" params={props.params}/>
            <IntegerStressParam name="Test Memory Size" description="The size of the memory buffer that contains the global testing locations (values should be between 256 and 4096)" paramName="testMemorySize" params={props.params}/>
            <IntegerStressParam name="Scratch Memory Size" description="The size of the memory buffer where threads stress the memory" paramName="scratchMemorySize" params={props.params}/>
            <IntegerStressParam name="Memory Stride" description="The testing locations in the litmus test are guaranteed to be seperated by at least this many 32-bit words (values should be between 1 and 128)" paramName="memStride" params={props.params}/>
            <IntegerStressParam name="Memory Stress Percentage" description="The percentage of iterations in which all non-testing threads repeatedly access the scratch memory to cause memory stress (values should be between 0 and 100)" paramName="memStressPct" params={props.params}/>
            <IntegerStressParam name="Memory Stress Loops" description="How many times the non-testing threads loop on their memory stress access pattern (values should be between 0 and 1024)" paramName="memStressIterations" params={props.params}/>
            <IntegerStressParam name="Pre-Stress Percentage" description="The percent of iterations in which the testing threads access the scratch memory region before executing their part of the litmus test (values should be between 0 and 100)" paramName="preStressPct" params={props.params}/>
            <IntegerStressParam name="Pre-Stress Loops" description="How many times the testing threads perform their accesses on the scratch memory region before performing the litmus test  (values should be between 0 and 2048)" paramName="preStressIterations" params={props.params}/>
            <IntegerStressParam name="Stress Line Size" description="The non-testing threads will access disjoint memory locations at seperatated by at least this many 32-bit words (values should be between 1 and 128)" paramName="stressLineSize" params={props.params}/>
            <IntegerStressParam name="Stress Target Lines" description="How many disjoint memory locations the non-testing threads access in the scratch memory region (values should be between 1 and 128)" paramName="stressTargetLines" params={props.params}/>
            <DropdownStressParam name="Stress Assignment Strategy" description="How non-testing threads are assigned to scratch memory regions to access" paramName="stressAssignmentStrategy" params={props.params} options={["round-robin", "chunking"]} updateFunc={stressAssignmentStrategyOnChange}/>
            <DropdownStressParam name="Memory Stress Pattern" description="The access pattern that non-testing threads access the scratch memory region" paramName="memStressPattern" params={props.params} options={["load-store", "store-load", "load-load", "store-store"]} updateFunc={stressPatternOnChange}/>
            <DropdownStressParam name="Pre Stress Pattern" description="The access pattern that testing threads access the scratch memory region before executing their litmus test" paramName="preStressPattern" params={props.params} options={["load-store", "store-load", "load-load", "store-store"]} updateFunc={stressPatternOnChange}/>
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
