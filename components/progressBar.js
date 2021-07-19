import { ProgressBar } from 'react-bootstrap';
import { useState } from 'react';
import { getCurrentIteration, checkFinish } from '../components/litmus-setup';
import { getIterationNum } from './test-page-setup';
let finish;
let percentage = 0;
let finalIter = 0;
let finalPercentage = 0;
let defaultState = true;
export function resetProgressBar(){
    finish = false; 
    percentage = 0;
}
export function setProgressBarState(){
    defaultState = false;
}
export default function progressBar(){
    percentage = Math.floor(getCurrentIteration()*100/getIterationNum());
    finalIter = getCurrentIteration()+1;
    finalPercentage =  Math.floor(finalIter*100/getIterationNum());
    finish = checkFinish();
    console.log(finish);
    return(
        <>
        {defaultState ? (
            <div className="progressBar">
                <ProgressBar now={0}/>
            </div>
        ) : (
          <div className="progressBar">
            {finish ? (<ProgressBar now = {finalPercentage} label ={`Done`}/>): (<ProgressBar now={percentage} label={`${percentage}% completed`}  animated/> )}
          </div>
        )}
        </>
    );
}