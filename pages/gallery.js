import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import intel_iris_0 from '../results/intel_iris_0.json';
import parakeet from '../results/parakeet_0.json';
import nvidia_0 from '../results/nvidia_geforce_0.json';
import tim_0 from '../results/tim_0.json';
import amd_0 from '../results/amd_0.json';

let weakMemoryKeys = Object.keys(intel_iris_0["0"]);

function getPageState() {
  const [activeDatasets, setActiveDatasets] = useState([]);

  return {
    activeDatasets: {
      value: activeDatasets,
      update: setActiveDatasets
    },
    datasets: [intel_iris_0, parakeet, nvidia_0, tim_0, amd_0]
  }
}

function Selector(props) {
  return (
    <>
      <p className="menu-label">
        {props.category}
      </p>
      <ul className="menu-list">
        {props.options.map(option => option.jsx)}
      </ul>
    </>
  )
}

function Option(props) {
  return (
    <>
      <div>
        <input type="checkbox" checked={props.isChecked} onChange={props.handleOnChange} />
        {props.name}
      </div>
    </>
  )
}

function buildOption(name) {
  const [isChecked, setIsChecked] = useState(false);

  const handleOnChange = () => {
    setIsChecked(!isChecked);
  };

  return {
    name: name,
    isChecked: isChecked,
    setIsChecked: setIsChecked,
    jsx: <Option key={name} name={name} isChecked={isChecked} handleOnChange={handleOnChange}/>
  }
}

function buildTotalWeakBehaviorsDataset(results, color) {
  let data = [];
  for (const key of weakMemoryKeys) {
    let sum = 0;
    for (let i = 0; i < results.configurations; i++) {
      sum += results[i.toString()][key].weak;
    }
    data.push(sum);
  }
  return {
    label: results.gpu,
    data: data,
    backgroundColor: color,
    borderWidth: 1
  }
}

function totalWeakBehaviorChart(pageState) {
  let colors = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(255, 159, 64, 0.2)',
    'rgba(255, 205, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(201, 203, 207, 0.2)'
  ];
  let datasets = [];
  let i = 0;
  let maxValue = 0;
  for (let dataset of pageState.activeDatasets.value) {
    let result = buildTotalWeakBehaviorsDataset(dataset, colors[i]);
    if (maxValue < Math.max(result.data)) {
      maxValue = Math.max(result.data);
    }
    datasets.push(result);
    i++;
  }
  const data = {
    labels: weakMemoryKeys,
    datasets: datasets
  }
  const options = {
    plugins: {
      title: {
        display: true,
        position: "top",
        text: ['Total Weak Behaviors'],
        fontSize: 20
      },
    },
    scales: {
      yAxis: {
        axis: 'y',
        type: 'logarithmic',
        min: 0.1,
        max: maxValue,
        ticks: {
          callback: function (value, index, values) {
            var val = value;
            while (val >= 10 && val % 10 == 0) {
              val = val / 10;
            }
            if (val == 1) {
              return value;
            }
          }
        }
      }
    }
  }
  return <Bar data={data} options={options}/>;
}

function getOptionsSelector(pageState) {
  let gpuOptions = [
    buildOption("Intel Iris Plus Graphics 1536 MB"),
    buildOption("Intel UHD Graphics (CML GM2)"),
    buildOption("Nvidia GeForce RTX 2080"),
    buildOption("Tim"),
    buildOption("AMD")
  ];

  return {
    gpuOptions: gpuOptions,
    jsx: (
      <>
        <div className="column is-one-third mr-2">
          <nav className="panel">
            <p className="panel-heading">
              Selected Options
            </p>
            <div className="container" style={{ overflowY: 'scroll', overflowX: 'hidden', height: '350px' }}>
              <aside className="menu">
                <Selector category="GPU" options={gpuOptions}/>
              </aside>
            </div>
            <div className="panel-block p-2">
              <div className="columns is-2 ">
                <div className="column">
                  <b> Presets </b>
                  <div className="buttons are-small">
                    <button className="button is-link is-outlined " onClick={() => {
                      gpuOptions.map(option => option.setIsChecked(true));
                    }}>
                      Select all
                    </button>
                    <button className="button is-link is-outlined " onClick={() => {
                      gpuOptions.map(option => option.setIsChecked(false));
                    }}>
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="panel-block p-2">
              <div className="columns">
                <div className="column">
                  <div className="buttons are-small">
                    <button className="button is-link is-outlined " onClick={() => {
                      updateActiveDataSets(pageState, gpuOptions);
                    }}>
                      Apply Options
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </nav>
        </div>
      </>
    )
  }
}

function updateActiveDataSets(pageState, gpuOptions) {
  let newDatasets = [];
  for (const option of gpuOptions) {
    if (option.isChecked) {
      for (const dataset of pageState.datasets) {
        if (option.name === dataset.gpu) {
          newDatasets.push(dataset);
        }
      }
    }
  }
  pageState.activeDatasets.update(newDatasets);
}

export default function Gallery() {
  let pageState = getPageState();
  let optionsSelector = getOptionsSelector(pageState);
  let chart = totalWeakBehaviorChart(pageState);
  return (
    <>
      <div className="columns">
        <div className="column">
          <div className="section">
            <h1 className="testName">Results Gallery</h1>
            <p>
              Peruse the results of running tuning suites across many GPUs.
            </p>
          </div>
        </div>
        {optionsSelector.jsx}
      </div>
      <div className="columns">
        <div className="column">
          {chart}
        </div>
      </div>
    </>
  )
}
