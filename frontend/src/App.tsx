import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Appbar from './components/Appbar'
import ShrinkUrl from './pages/ShrinkUrl'
import OpenUrl from './pages/OpenUrl'

function App() {

  return (
    <div className='h-full'>
      <Appbar/>
      <BrowserRouter>
        <Routes>
          <Route element={<ShrinkUrl/>} path='/'/>
          <Route element={<OpenUrl/>} path='/*'/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
