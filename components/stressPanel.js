function StressParam(props) {
  return (
    <>
    <div className="panel-block "> 
        <div className="control">
        <div className="columns p-2">
            <div className="column is-one-third">
            <span>{props.name}</span>
            </div>
            <div className="column">
            <input className="input is-small" type={props.type} placeholder="Value" onInput={(e) => {
                    props.update(e.target);
            }}/>
            </div>
        </div>
        </div> 
    </div>
    </>
  );
}

export default function stressPanel(props) {
  return (
  <>
    <div className="column is-one-third mr-2">
    <nav className="panel">
        <p className="panel-heading">
          Stress Parameters
        </p>
        <div className="container"  style={{overflowY:'scroll', overflowX: 'hidden', height:'350px'}}>
        <StressParam name="Workgroups" type="number" update={(target) => {props.params.minWorkgroups = target.valueAsNumber; props.params.maxWorkgroups = target.valueAsNumber;}}></StressParam>
        <StressParam name="Shuffle Percentage" type="number" update={(target) => {props.params.shufflePct = target.valueAsNumber;}}></StressParam>
        <StressParam name="Barrier Percentage" type="number" update={(target) => {props.params.barrierPct = target.valueAsNumber;}}></StressParam>
        <StressParam name="Test Memory Size" type="number" update={(target) => {props.params.testMemorySize = target.valueAsNumber;}}></StressParam>
        <StressParam name="Scratch Memory Size" type="number" update={(target) => {props.params.scratchMemorySize = target.valueAsNumber;}}></StressParam>
        <StressParam name="Memory Stride" type="number" update={(target) => {props.params.memStride = target.valueAsNumber;}}></StressParam>
        <StressParam name="Memory Stress Percentage" type="number" update={(target) => {props.params.memStressPct = target.valueAsNumber;}}></StressParam>
        <StressParam name="Memory Stress Iterations" type="number" update={(target) => {props.params.memStressIterations = target.valueAsNumber;}}></StressParam>
        <StressParam name="Pre-Stress Percentage" type="number" update={(target) => {props.params.preStressPct = target.valueAsNumber;}}></StressParam>
        <StressParam name="Pre-Stress Iterations" type="number" update={(target) => {props.params.preStressIterations = target.valueAsNumber;}}></StressParam>
        <StressParam name="Stress Line Size" type="number" update={(target) => {props.params.stressLineSize = target.valueAsNumber;}}></StressParam>
        <StressParam name="Stress Target Lines" type="number" update={(target) => {props.params.stressTargetLines = target.valueAsNumber;}}></StressParam>
        <StressParam name="Stress Assignment Strategy" type="text" update={(target) => {props.params.stressAssignmentStrategy = target.value;}}></StressParam>
        </div>
        <div className="panel-block p-2">
          <button className="button is-link is-outlined is-fullwidth "style={{width: "200px", marginLeft:"10px"}}>
            Reset all Parameters
          </button>
        </div>
      </nav>
    </div>
  </>
  );
}