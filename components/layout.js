import styles from './layout.module.css'

export default function Layout({ children }) {
  return (
  <>
  <div class="columns">
    <div class="column">
    {children}
    </div>
  </div>
  <div class="columns">
    <div class="column">
      here goes the code 
    </div>
    <div class="column is-one-third">
      <nav class="panel">
        <p class="panel-heading">
          Stress Parameters
        </p>
        <p class="control">
          <div class="columns p-2">
            <div class="column is-one-third">
            <span>Param 1</span>
            </div>
            <div class="column">
              <input class="input is-small" type="text" placeholder="Parameter 1"/>
            </div>
          </div>
         </p>
         <p class="control">
          <div class="columns p-2">
            <div class="column is-one-third">
            <span>Param 2</span>
            </div>
            <div class="column">
              <input class="input is-small" type="text" placeholder="Parameter 2"/>
            </div>
          </div>
         </p>
         <p class="control">
          <div class="columns p-2">
            <div class="column is-one-third">
            <span>Param 3</span>
            </div>
            <div class="column">
              <input class="input is-small" type="text" placeholder="Parameter 3"/>
            </div>
          </div>
         </p>
        <div class="panel-block">
          <button class="button is-link  ">
            Reset all Paramters
          </button>
        </div>
      </nav>
    </div>
  </div>
  <div class="columns">
    <div class="column is-one-fifth">
    <p class="control">
      <input class="input" type="text" placeholder="Iterations"/>
    </p>
    <div class="buttons mt-2">
      <button class="button is-primary">Start Test</button>
    </div>
    </div>
    <div class="column">
      here goes the text histagram 
    </div>
  </div>
  </>
  );
}