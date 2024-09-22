import React, { useState, useEffect } from 'react';
import { getCourts, createReservation, getReservations, socket } from '../services/api';

const BadmintonReservation = () => {
  const [name, setName] = useState('');
  const [partyNames, setPartyNames] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [courts, setCourts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCourts();
    fetchReservations();

    socket.on('newReservation', (newReservation) => {
      setReservations(prevReservations => [...prevReservations, newReservation]);
    });

    socket.on('deletedReservation', (deletedReservationId) => {
      setReservations(prevReservations => 
        prevReservations.filter(reservation => reservation._id !== deletedReservationId)
      );
    });

    return () => {
      socket.off('newReservation');
      socket.off('deletedReservation');
    };
  }, []);

  const fetchCourts = async () => {
    try {
      const response = await getCourts();
      setCourts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courts:', error);
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await getReservations();
      setReservations(response.data);
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
          startTime: selectedTime,
          endTime: new Date(new Date(selectedTime).getTime() + 90 * 60000)
        };
        await createReservation(reservationData);
        setName('');
        setPartyNames('');
        setSelectedCourt(null);
        setSelectedTime(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error('Error creating reservation:', error);
      }
    }
  };

  const isReserved = (court, slot) => {
    return reservations.some(r => 
      r.courtId === court._id && 
      new Date(r.startTime).toISOString() === new Date(slot.startTime).toISOString()
    );
  };

  const handleCellClick = (court, time) => {
    if (!isReserved(court, time)) {
      setSelectedCourt(court._id);
      setSelectedTime(time.startTime);
    }
  };

  const handleCellHover = (court, slot) => {
    const reservation = reservations.find(r => 
      r.courtId === court._id && 
      new Date(r.startTime).toISOString() === new Date(slot.startTime).toISOString()
    );
    if (reservation) {
      setHoverInfo({ court, slot, ...reservation });
    } else {
      setHoverInfo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Badminton Court Reservation</h1>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="space-y-4">
          <label htmlFor="partyNames" className="block text-sm font-medium text-gray-700">Party's Names:</label>
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
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-center">Court Availability</h2>
        <p className="mb-4 text-center text-gray-600">Click on an available slot to select it for reservation. Hover over reserved slots to see details.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border bg-gray-200"></th>
                {courts.map(court => (
                  <th key={court._id} className="p-2 border bg-gray-200">Court {court.courtNumber}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courts[0] && courts[0].slots.map(slot => (
                <tr key={slot.startTime}>
                  <td className="p-2 border font-bold text-sm">
                    {new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  {courts.map(court => (
                    <td
                      key={`${court._id}-${slot.startTime}`}
                      className={`p-2 border text-center cursor-pointer transition-colors duration-200 ${
                        isReserved(court, slot)
                          ? 'bg-red-200 hover:bg-red-300'
                          : selectedCourt === court._id && selectedTime === slot.startTime
                          ? 'bg-yellow-200 hover:bg-yellow-300'
                          : 'bg-green-200 hover:bg-green-300'
                      }`}
                      onClick={() => handleCellClick(court, slot)}
                      onMouseEnter={() => handleCellHover(court, slot)}
                      onMouseLeave={() => setHoverInfo(null)}
                    >
                      {isReserved(court, slot) ? '🚫' : selectedCourt === court._id && selectedTime === slot.startTime ? '✅' : '🟢'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {hoverInfo && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Reservation Details:</h3>
          <p><span className="font-semibold">Court:</span> {hoverInfo.court.courtNumber}</p>
          <p><span className="font-semibold">Time:</span> {new Date(hoverInfo.slot.startTime).toLocaleString()}</p>
          <p><span className="font-semibold">Reserved by:</span> {hoverInfo.userName}</p>
          <p><span className="font-semibold">Party:</span> {hoverInfo.partyNames}</p>
        </div>
      )}
      <div className="mt-8">
        <p className="mb-4 text-center font-semibold">
          {selectedCourt && selectedTime 
            ? `Selected: Court ${courts.find(c => c._id === selectedCourt)?.courtNumber} at ${new Date(selectedTime).toLocaleString()}`
            : 'Please select a court and time from the visualization above'}
        </p>
        <button 
          onClick={handleReservation}
          className={`w-full p-3 rounded-md transition-colors duration-200 ${
            name && partyNames && selectedCourt && selectedTime
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!(name && partyNames && selectedCourt && selectedTime)}
        >
          Reserve Court
        </button>
      </div>
      {success && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          Reservation successfully created!
        </div>
      )}
    </div>
  );
};

export default BadmintonReservation;