import {GameMain} from './GameMain.js'
import {MainMenu} from './Menu.js'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
  Navigate
} from "react-router-dom";
//<GameMain/>)
const App = ()=>(
<Router>
            <div>
              <Routes>
                <Route exact path="/" element={<MainMenu/>} />
                <Route path='livegame/:id' element={<GameMain/>}>
					
                </Route>
                <Route path="*" element={<Navigate to={'/error404'} />} />
				<Route path='/error404' element={<h2>Ресурс не найден</h2>}/>
               </Routes>
            </div>
        </Router>)
/*		<Route exact path='/livegame/:id' component={(props)=>{  console.log(props);
     return isTruePath(props.match.url) ?<GameMain {...props}/> : <Navigate to="/"/>
}}> 
const isTruePath = (str)=> {
    let re = /^(\/app\/project\/)(?!item)/;
    return re.test(str);	}	*/
export default App;
