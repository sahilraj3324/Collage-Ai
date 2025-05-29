import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Genrate from './components/Genrate'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Genrate />
    </>
  )
}

export default App
