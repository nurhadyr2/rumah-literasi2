import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import * as React from 'react';
import {
	MapContainer,
	Marker,
	TileLayer,
	useMap,
	useMapEvents,
} from 'react-leaflet';
import { cn } from '@/libs/utils';

const MapEvent = ({ handleClick }) => {
	useMapEvents({
		click: (e) => {
			handleClick(e.latlng);
		},
	});
	return null;
};

const ChangeView = ({ lat, lng }) => {
	const map = useMap();

	React.useEffect(() => {
		if (lat && lng) {
			map.flyTo([lat, lng], 15);
		}
	}, [map, lat, lng]);

	return null;
};

export const Map = ({ location, setLocation = () => {}, className }) => {
	const handleClick = (latlng) => {
		setLocation({
			latitude: latlng.lat,
			longitude: latlng.lng,
		});
	};

	const lat = location?.latitude;
	const lng = location?.longitude;

	return (
		<MapContainer
			zoom={15}
			scrollWheelZoom={false}
			center={[lat, lng]}
			className={cn('w-full border rounded-xl z-0', className)}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			/>
			<ChangeView lat={lat} lng={lng} />
			<Marker position={[lat, lng]} />
			<MapEvent handleClick={handleClick} />
		</MapContainer>
	);
};
