import { render } from 'react-dom'
import 'antd/dist/antd.css'
import './styles.css'
import App from './App'
import AppRedux from './AppRedux'
import AppEntityAdapter from './AppEntityAdapter'

render(<AppEntityAdapter />, document.getElementById('root'))
