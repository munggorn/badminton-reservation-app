import React from 'react';
import './App.css';
import BadmintonReservation from './components/BadmintonReservation';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Badminton Court Reservation</h1>
      </header>
      <main>
        <BadmintonReservation />
      </main>
    </div>
  );
}

export default App;