import React, { useState , useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://badmindton-reservation-backend-48221d08d8e7.herokuapp.com/api'; 

const BadmintonReservation = () => {
  const [name, setName] = useState('');
  const [partyNames, setPartyNames] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reservations, setReservations] = useState({});
  const [hoverInfo, setHoverInfo] = useState(null);

  const courts = [1, 2, 3, 4];
  const timeSlots = [
    '10:00 - 11:30',
    '11:30 - 13:00',
    '13:00 - 14:30',
    '14:30 - 16:00',
    '16:00 - 17:30',
    '17:30 - 19:00',
    '19:00 - 20:30',
    '20:30 - 22:00'
  ];

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API_URL}/reservations`);
      const reservationData = {};
      response.data.forEach(reservation => {
        reservationData[`${reservation.courtId}-${reservation.timeSlot}`] = {
          id: reservation._id,
          courtId: reservation.courtId,
          timeSlot: reservation.timeSlot,
          name: reservation.userName,
          partyNames: reservation.partyNames
        };
      });
      setReservations(reservationData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleReservation = async () => {
    if (name && partyNames && selectedCourt && selectedTime) {
      try {
        const reservationData = {
          courtId: selectedCourt,
          userName: name,
          partyNames: partyNames,
          timeSlot: selectedTime
        };
  
        console.log('Sending reservation data:', reservationData);
        await axios.post(`${API_URL}/reservations`, reservationData);
        await fetchReservations(); // Refresh reservations after creating a new one
        setName('');
        setPartyNames('');
        setSelectedCourt(null);
        setSelectedTime(null);
      } catch (error) {
        console.error('Error creating reservation:', error.response?.data || error.message);
      }
    }
  };

  const isReserved = (court, slot) => {
    return reservations[`${court}-${slot}`];
  };

  const handleCellClick = (court, time) => {
    if (!isReserved(court, time)) {
      setSelectedCourt(court);
      setSelectedTime(time);
    }
  };

  const handleCellHover = (court, slot) => {
    const reservation = reservations[`${court}-${slot}`];
    if (reservation) {
      setHoverInfo({ court, slot, ...reservation });
    } else {
      setHoverInfo(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Badminton Court Reservation</h1>
        <p className="text-gray-600">Book your court quickly and easily</p>
      </header>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block mb-2 font-semibold text-gray-700">Your Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="partyNames" className="block mb-2 font-semibold text-gray-700">Party's Names:</label>
          <textarea
            id="partyNames"
            value={partyNames}
            onChange={(e) => setPartyNames(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            required
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Court Availability</h2>
        <p className="mb-4 text-gray-600">Click on an available slot to select it for reservation. Hover over reserved slots to see details.</p>
        <div className="grid grid-cols-5 gap-2">
          <div className="font-bold"></div>
          {courts.map(court => (
            <div key={court} className="font-bold text-center bg-gray-100 py-2 rounded">Court {court}</div>
          ))}
          {timeSlots.map(slot => (
            <React.Fragment key={slot}>
              <div className="font-bold text-sm bg-gray-100 py-2 px-1 rounded">{slot}</div>
              {courts.map(court => (
                <div
                  key={`${court}-${slot}`}
                  className={`p-2 text-center cursor-pointer rounded transition duration-300 ${
                    isReserved(court, slot)
                      ? 'bg-red-300 hover:bg-red-400'
                      : selectedCourt === court && selectedTime === slot
                      ? 'bg-yellow-300 hover:bg-yellow-400'
                      : 'bg-green-300 hover:bg-green-400'
                  }`}
                  onClick={() => handleCellClick(court, slot)}
                  onMouseEnter={() => handleCellHover(court, slot)}
                  onMouseLeave={() => setHoverInfo(null)}
                >
                  {isReserved(court, slot) ? 'R' : selectedCourt === court && selectedTime === slot ? 'Selected' : 'A'}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {hoverInfo && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2 text-blue-800">Reservation Details:</h3>
          <p><span className="font-semibold">Court:</span> {hoverInfo.court}</p>
          <p><span className="font-semibold">Time:</span> {hoverInfo.slot}</p>
          <p><span className="font-semibold">Reserved by:</span> {hoverInfo.name}</p>
          <p><span className="font-semibold">Party:</span> {hoverInfo.partyNames}</p>
        </div>
      )}

      <div className="mt-8">
        <p className="mb-4 text-center font-semibold text-gray-700">
          {selectedCourt && selectedTime
            ? `Selected: Court ${selectedCourt} at ${selectedTime}`
            : 'Please select a court and time from the visualization above'}
        </p>
        <button
          onClick={handleReservation}
          className={`w-full p-3 rounded-md transition-colors duration-300 ${
            name && partyNames && selectedCourt && selectedTime
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!(name && partyNames && selectedCourt && selectedTime)}
        >
          Reserve Court
        </button>
      </div>
    </div>
  );
};

export default BadmintonReservation;
