import truckImage1 from '../src/assets/NMR-_EURO4_Box-Besi.png';

const AnimatedTruck = () => {
  return (
    <div className="truck-container" style={{ overflow: 'hidden', position: 'relative', height: '120px', marginTop: '-10px', marginBottom: '10px' }}>
      <img
        src={truckImage1}
        alt="Truck"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '0',
          height: '100px',
          transform: 'translateX(-50%)',
        }}
      />
      <div className="road" style={{
        position: 'absolute',
        bottom: '0',
        height: '20px',
        backgroundColor: '#333',
        width: '100%',
      }} />
    </div>
  );
};

export default AnimatedTruck;