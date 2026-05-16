import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import * as React from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { cn } from '@/libs/utils';

const MapEvent = ({ handleClick, handleLocationFound }) => {
	useMapEvents({
		click: (e) => {
			handleClick(e.latlng);
		},
		update: (e) => {
			handleLocationFound(e.target.getCenter());
		},
	});

	return null;
};

export const Map = ({ location, setLocation = () => {}, className }) => {
	const [mapRef, setMapRef] = React.useState(null);

	const handleClick = (latlng) => {
		setLocation({
			latitude: latlng.lat,
			longitude: latlng.lng,
		});
	};

	React.useEffect(() => {
		if (mapRef) mapRef.flyTo([location.latitude, location.longitude], 15);
	}, [mapRef, location]);
	function ChangeView({ center }) {
		const map = useMap();
		useEffect(() => {
			if (center) {
				map.setView(center, 16);
			}
		}, [center, map]);
		return null;
	}
	return (
		<MapContainer
			zoom={15}
			ref={setMapRef}
			scrollWheelZoom={false}
			center={[location.latitude, location.longitude]}
			className={cn('w-full border rounded-xl z-0', className)}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			/>
			<Marker position={[location.latitude, location.longitude]}></Marker>
			<MapEvent handleClick={handleClick} handleLocationFound={handleClick} />
		</MapContainer>
	);
};
