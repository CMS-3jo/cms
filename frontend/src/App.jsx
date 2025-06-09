import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [apiTest, setApiTestMsg] = useState('test');

  const callSpringBootApi = () => {
      setApiTestMsg('API 호출 중...'); 

      fetch('/api/test') 
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(data => {
          setApiTestMsg("API 호출 성공!"); 
          console.log("Spring Boot에서 받은 응답:", data);
        })
        .catch(error => {
          setApiTestMsg(`API 호출 실패: ${error.message}`); 
          console.error("API 호출 중 오류 발생:", error);
        });
    };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
		<button onClick={() => callSpringBootApi()}>
		          API 호출
		</button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
