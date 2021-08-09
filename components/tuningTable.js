import { useState } from 'react';
import mpCode from '../shaders/message-passing.wgsl'
import { runLitmusTest, reportTime, getCurrentIteration } from '../components/litmus-setup.js'
export function doMP(pageState, testParams, shaderCode, state){

}
function buildTest(){

}
export default function tuningTable(){
    return (
    <>
     <div className="columns mr-2">
        <div className="column is-two-thirds">
            <div className="columns">
            <table className="table is-striped ">
                <thead>
                <tr>
                    <th>Test Number</th>
                    <th>Progress</th>
                    <th>Iterations per second</th>
                    <th>Time (seconds)</th>
                    <th>Seq 0 0</th>
                    <th>Seq 0 1</th>
                    <th>Interleavings</th>
                    <th>Weak Behaviors</th>
                    <th>Parameters</th>
                </tr>
                </thead>
            </table>
        </div>
        </div>
    </div>
    </>
    );
}