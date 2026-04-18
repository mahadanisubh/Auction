import './loader.css';

export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="loader-container" role="status">
      <div className="loader-spinner"></div>
      <p>{message}</p>
    </div>
  );
}
