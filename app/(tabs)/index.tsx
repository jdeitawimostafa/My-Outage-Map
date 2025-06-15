import CustomModal from '@/components/CustomModal';
import { GetMapConfig, GetOutages, GetTotalCustomers } from '@/components/Services/apiService';
import { Hit, LatLng, MapConfig, Outages } from '@/types/types';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import "react-native-get-random-values";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, Polygon } from 'react-native-maps';

const polygonCoords: LatLng[] = [
  { latitude: 28.200, longitude: -82.750 },
  { latitude: 28.250, longitude: -82.400 },
  { latitude: 28.150, longitude: -82.200 },
  { latitude: 28.000, longitude: -82.100 },
  { latitude: 27.870, longitude: -82.150 },
  { latitude: 27.780, longitude: -82.250 },
  { latitude: 27.700, longitude: -82.380 },
  { latitude: 27.750, longitude: -82.520 },
  { latitude: 27.850, longitude: -82.650 },
  { latitude: 28.000, longitude: -82.700 },
  { latitude: 28.200, longitude: -82.750 },
];

export default function HomeScreen() {
  const [outages, setOutages] = useState<Outages>();
  const [mapConfig, setMapConfig] = useState<MapConfig>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [hitData, setHitData] = useState<Hit>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalCustomerOut, setTotalCustomerOut] = useState<number>(0);
  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<any>(null);

  const fetchMapData = async () => {
    const mapConfig = await GetMapConfig();
    const outages = await GetOutages();
    const totalCustomerCount = await GetTotalCustomers();
    setTotalCustomerOut(totalCustomerCount?.customerCountSum?.value);
    setOutages(outages);
    setMapConfig(mapConfig);
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    //setOutages(undefined);
    await fetchMapData();
    if (mapConfig) {
      const region = {
        latitude: Number(mapConfig.CenterPosition_Mobile.split(',')[0]),
        longitude: Number(mapConfig.CenterPosition_Mobile.split(',')[1]),
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
      mapRef.current?.animateToRegion(region, 1000);
      searchRef.current?.setAddressText('');
    }
    setRefreshing(false);
  };

  const handleClickedMarker = (hit: Hit) => {
    setModalVisible(true);
    setHitData(hit);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.container}>
          {outages?.hits?.hits ? (
            <MapView
              ref={mapRef}
              initialRegion={{
                latitude: Number(mapConfig?.CenterPosition_Mobile.split(',')[0]),
                longitude: Number(mapConfig?.CenterPosition_Mobile.split(',')[1]),
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
              style={styles.map}
              showsUserLocation
            >
              <Polygon
                coordinates={polygonCoords}
                strokeColor="rgba(102, 102, 102, 0.8)"
                fillColor="rgba(188, 188, 188, 0.45)"
                strokeWidth={1}
              />
              {Array.isArray(outages?.hits?.hits)
                ? outages.hits.hits.map((point) => (
                  <Marker
                    key={point._id}
                    onPress={() => handleClickedMarker(point)}
                    coordinate={{
                      latitude: point._source.polygonCenter[1],
                      longitude: point._source.polygonCenter[0],
                    }}
                  >
                    <View
                      style={[styles.circle, {
                        backgroundColor:
                          point._source.customerCount > 1000 ? '#e53935' : '#43a047',
                      }]}
                    >
                      <Text style={styles.text}>
                        {point._source.customerCount > 1000 ? '1K' : '1'}
                      </Text>
                    </View>
                  </Marker>
                ))
                : null}
            </MapView>
          ) : (
            <View style={styles.activityIndicatorStyle}>
              <ActivityIndicator size="large" />
            </View>
          )}
          {
            outages?.hits?.hits ? <View style={styles.absoluteTopBar}>
              <Text style={styles.totalOutText}>Total Customers Out: {totalCustomerOut}</Text>
              <GooglePlacesAutocomplete
                ref={searchRef}
                placeholder="Search by address or outage ID"
                fetchDetails={true}
                onPress={(data, details = null) => {
                  const { lat, lng } = details?.geometry.location;
                  const region = {
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5,
                  };
                  mapRef.current?.animateToRegion(region, 1000);
                }}
                query={{
                  key: 'AIzaSyCUpCrEx5Gs1_p6dSgUlCscX2fWZHusWMA',
                  language: 'en',
                }}
                styles={{
                  textInputContainer: { backgroundColor: 'transparent' },
                  textInput: {
                    height: 44,
                    backgroundColor: '#f0f0f0',
                    fontSize: 16,
                  },
                  row: {
                    padding: 13,
                    backgroundColor: '#fff',
                    borderBottomColor: '#ddd',
                    borderBottomWidth: 1,
                  },
                  description: {
                    fontSize: 16,
                    color: '#333',
                    fontWeight: '500',
                  },
                  separator: { height: 0.5, backgroundColor: '#c8c7cc' },
                  poweredContainer: { backgroundColor: '#f0f0f0' },
                }}
              />

            </View>
              : null
          }

          <CustomModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            modalWidth={350}
            modalHeight={230}
            hitData={hitData!}
          />
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30
  },
  map: {
    width: '100%',
    height: '100%',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ffffff',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  totalOutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    paddingTop: 4,
    paddingHorizontal: 8,
  },
  absoluteTopBar: {
    position: 'absolute',
    top: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  activityIndicatorStyle: { alignItems: "center", top: "40%" }
});