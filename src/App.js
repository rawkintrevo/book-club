import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getDatabase } from 'firebase/database';
// import { getFirestore } from 'firebase/firestore';

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login/Login';

// import logo from './logo.svg';
import './App.css';
import Register from "./components/Register/Register";

const firebaseConfig = {
  apiKey: "AIzaSyASEJGWw6vUO_23e_W157Gi7ydKs2a2w3o",
  authDomain: "book-club-aa.firebaseapp.com",
  projectId: "book-club-aa",
  storageBucket: "book-club-aa.appspot.com",
  messagingSenderId: "602622615648",
  appId: "1:602622615648:web:b7d7ad9e5cb32357e52305"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const database = getDatabase(app);
// const firestore = getFirestore(app);


function App() {
  return (
      <Router>
        <div className="App">
            <Routes>
                <Route path="/"         element={<Login auth={auth} />} />
                <Route path="/register" element={<Register auth={auth} />} />
                {/* Add more routes for other pages/components */}

            </Routes>

        </div>
      </Router>
  );
}

export default App;
