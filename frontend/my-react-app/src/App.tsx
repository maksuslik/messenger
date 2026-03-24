import { useAuth } from './AuthContext';
import api from './AuthContext';
//import api from './AuthContext';
import { useEffect, useState } from 'react';

function App() {
  const { user, isLoading } = useAuth();
  const [message, setMessage] = useState('');

  if (isLoading) return <div>Загрузка профиля...</div>;

  const testData = async () => {
    setMessage("Загрузка...")
    const authToken = localStorage.getItem('authToken')
    try {
      // Пример защищенного запроса
      const res = await api.get('/auth/me', {
        headers: {
          "X-Auth-Token": authToken
        }
      });
      console.log(res.data)
      setMessage(`Response: ${res.status} OK. Login: ${res.data.login}; id: ${authToken}; authToken: ${res.data.id}`);
    } catch (e) {
      setMessage('Ошибка доступа');
    }
  };

  return (
    <div>
      <h1>Логин: {user?.login}</h1>
      <button onClick={testData}>Fetch data</button>
      <p>{message}</p>
    </div>
  );
}

export default App;