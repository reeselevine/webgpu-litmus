import { ProgressBar } from 'react-bootstrap';
import { getCurrentIteration } from '../components/litmus-setup';
import { getIterationNum } from './test-page-setup';
let checkLast;
let percentage = 0;
let defaultState = true;
export function resetProgressBar(){
    defaultState = true;
    percentage = 0;
}
export function setProgressBarState(){
    defaultState = false;
}
function lastIteration(){
    if(getCurrentIteration() +1 == getIterationNum()){
        return true;
    }
    else return false;
}
export default function progressBar(){
    percentage = Math.floor(getCurrentIteration()*100/getIterationNum());
    checkLast = lastIteration();
    return(
        <>
        {defaultState ? (
            <div className="progressBar">
                <ProgressBar now={0}/>
            </div>
        ) : (
          <div className="progressBar">
            {checkLast ? (<ProgressBar now = {100} label ={`Done`}/>): (<ProgressBar now={percentage} label={`${percentage}% completed`}  animated/> )}
          </div>
        )}
        </>
    );
}