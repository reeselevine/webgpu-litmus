export default function Home() {
  return (
    <div className="section">
      <h3>WebGPU Memory Model Testing</h3>
      <p>
        <a href="https://web.dev/gpu/">WebGPU</a> is a new framework for writing applications targeting GPUs. This website is focused on testing WebGPU's memory model, which specifies the semantics and rules threads must follow when sharing memory. Specifically, we use litmus tests, small parallel programs that showcase the allowed behaviors of a given memory model. For more information on
        litmus tests and shared memory consistency models, see <a href="https://users.soe.ucsc.edu/~tsorensen/files/oopsla2020.pdf">this</a> paper by Kirkham et al. (OOPSLA 2020).
      </p>
      <h4>Website Guide</h4>
      <p>
        The goals of this website are to explore ways to better test memory models and to use the results of this exploration to empirically verify the implementation of WebGPU's memory model. In order to do this, we define a large suite of litmus tests in several different categories, all of which are available on the left hand navigation panel.
        <li>
          <b>Weak Memory Tests</b>: These test the semantics of memory when two threads access multiple memory locations concurrently, specifically whether hardware is allowed to re-order certain combinations of reads and writes to different memory locations.
        </li>
        <li>
          <b>Coherence Tests</b>: These test the semantics of memory when a single memory location is accessed concurrently, ensuring coherency is respected.
        </li>
        <li>
          <b>Atomicity</b>: This test checks that an atomic read-modify-write instruction is, indeed, atomic.
        </li>
        <li>
          <b>Barrier Tests</b>: These test the implementation of WebGPU's barrier synchronization primitives, ensuring memory is properly synchronized with respect to the barrier.
        </li>
      </p>
      <h4>Test Page Layout</h4>
      <p>
        Each test page contains a brief description of the program under test, as well as pseudocode showing the instructions executed by each thread. The psuedocode also shows where each thread executes relative to the other and calls out the behavior of interest. Switching to the source code shows the actual wgsl shader that runs the test. Along with a "default" test, each page includes variants that vary the memory class and scope of the test, as well as adding barriers and read-modify-write instructions to disallow certain behaviors.
      </p>
      <p>
        Test pages are broken into two tabs, explorer mode and tuning mode.
      </p>
      <p>
        In explorer mode, a (log-scale) histogram shows the number of behaviors for each test run. The panel on the right allows the user to try different combinations of parameters to induce interesting behaviors. For a more comprehensive overview of these parameters, refer to the OOPSLA 2020 paper mentioned above. A few preset parameter sets are included to test quickly without having to manually adjust many parameters. Clicking the "Start Test" button runs the test for the specified number of iterations, displaying the results in the histogram in real time.
      </p>
      <p>
        In tuning mode, the user chooses a number of configurations to run and a number of iterations to run for. Each configuration generates a random parameter set and runs the test. This page allows users to generate data showing what parameter combinations are most effective at revealing weak behaviors or even bugs.
      </p>
      <h4>Other Pages</h4>
      <p>
        Besides the page for each test, we include a general tuning page and a conformance test suite page. On the tuning page, users can tune over multiple tests at a time, while the conformance test page includes a suite of tests that should not show any weak behaviors under WebGPU's memory model.
      </p>
    </div>
  )
}
