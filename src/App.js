import React from 'react';
import './App.css';
import BadmintonReservation from './components/BadmintonReservation';

function App() {
  return (
    <div className="App bg-gray-50 min-h-screen py-8">
      <header className="App-header mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800">Welcome to Badminton Court Reservation</h1>
      </header>
      <main>
        <BadmintonReservation />
      </main>
    </div>
  );
}

export default App;