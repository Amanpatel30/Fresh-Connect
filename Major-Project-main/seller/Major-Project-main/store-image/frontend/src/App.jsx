import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserForm from './components/UserForm'
import UserList from './components/UserList'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UserForm />} />
          <Route path="/users" element={<UserList />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
