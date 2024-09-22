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
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Badminton Court Reservation</h1>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block mb-2">Your Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="partyNames" className="block mb-2">Party's Names:</label>
          <textarea
            id="partyNames"
            value={partyNames}
            onChange={(e) => setPartyNames(e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
            required
          />
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Court Availability</h2>
        <p className="mb-2">Click on an available slot to select it for reservation. Hover over reserved slots to see details.</p>
        <div className="grid grid-cols-5 gap-2">
          <div className="font-bold"></div>
          {courts.map(court => (
            <div key={court._id} className="font-bold text-center">Court {court.courtNumber}</div>
          ))}
          {courts[0] && courts[0].slots.map(slot => (
            <React.Fragment key={slot.startTime}>
              <div className="font-bold text-sm">{new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              {courts.map(court => (
                <div
                  key={`${court._id}-${slot.startTime}`}
                  className={`p-2 text-center cursor-pointer ${
                    isReserved(court, slot)
                      ? 'bg-red-300'
                      : selectedCourt === court._id && selectedTime === slot.startTime
                      ? 'bg-yellow-300'
                      : 'bg-green-300 hover:bg-green-400'
                  }`}
                  onClick={() => handleCellClick(court, slot)}
                  onMouseEnter={() => handleCellHover(court, slot)}
                  onMouseLeave={() => setHoverInfo(null)}
                >
                  {isReserved(court, slot) ? 'R' : selectedCourt === court._id && selectedTime === slot.startTime ? 'Selected' : 'A'}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      {hoverInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Reservation Details:</h3>
          <p>Court: {hoverInfo.court.courtNumber}</p>
          <p>Time: {new Date(hoverInfo.slot.startTime).toLocaleString()}</p>
          <p>Reserved by: {hoverInfo.userName}</p>
          <p>Party: {hoverInfo.partyNames}</p>
        </div>
      )}
      <div className="mt-6">
        <p className="mb-2">
          {selectedCourt && selectedTime 
            ? `Selected: Court ${courts.find(c => c._id === selectedCourt)?.courtNumber} at ${new Date(selectedTime).toLocaleString()}`
            : 'Please select a court and time from the visualization above'}
        </p>
        <button 
          onClick={handleReservation}
          className={`w-full p-2 rounded ${
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
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Reservation successfully created!
        </div>
      )}
    </div>
  );
};

export default BadmintonReservation;