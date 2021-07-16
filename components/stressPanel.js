//import '../styles/stress.module.css'
import ScrollableList from './scrollableList';
export default function stressPanel() {
  
  return (
  <>
    <div className="column is-one-third mr-2">
    <nav className="panel">
        <p className="panel-heading">
          Stress Parameters
        </p>
        <div className="container"  style={{overflowY:'scroll', overflowX: 'hidden', height:'350px'}}>
        <ScrollableList></ScrollableList>
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