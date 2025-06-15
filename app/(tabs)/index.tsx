import CustomModal from '@/components/CustomModal';
import { GetMapConfig, GetOutages, GetTotalCustomers } from '@/components/Services/apiService';
import { Hit, MapConfig, Outages } from '@/types/types';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl, SafeAreaView, // ✅ Add this
  ScrollView, // ✅ Add this
  StyleSheet,
  Text,
  View
} from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

export default function HomeScreen() {
  const [outages, setOutages] = useState<Outages>();
  const [mapConfig, setMapConfig] = useState<MapConfig>();
  const [polygonCoords, setPolygonCoords] = useState<any>([
    { latitude: 28.030434678364376, longitude: -82.29390825895597 }
  ]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [hitData, setHitData] = useState<Hit>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalCustomerOut, setTotalCustomerOut] = useState<number>(0);
  const mapRef = useRef<MapView>(null);

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
    await fetchMapData();
    if (mapConfig) {
      const region = {
        latitude: Number(mapConfig.CenterPosition_Mobile.split(',')[0]),
        longitude: Number(mapConfig.CenterPosition_Mobile.split(',')[1]),
        latitudeDelta: 0.5,
        longitudeDelta: 0.5
      };
      mapRef.current?.animateToRegion(region, 1000); // 1000ms animation
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
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={ // ✅ pull-to-refresh logic
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          {
            outages?.hits?.hits ? <MapView
              ref={mapRef}
              initialRegion={{
                latitude: Number(mapConfig?.CenterPosition_Mobile.split(',')[0]),
                longitude: Number(mapConfig?.CenterPosition_Mobile.split(',')[1]),
                latitudeDelta: 0.5,
                longitudeDelta: 0.5
              }}
              style={styles.map}
            >
              <Text style={{ fontWeight: "bold", color: "white", marginTop: 15 }}> Total Customers Out : {totalCustomerOut}</Text>
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
                      longitude: point._source.polygonCenter[0]
                    }}
                  >
                    <View
                      style={[
                        styles.circle,
                        {
                          backgroundColor:
                            point._source.customerCount > 1000
                              ? '#e53935'
                              : '#43a047'
                        }
                      ]}
                    >
                      <Text style={styles.text}>
                        {point._source.customerCount > 1000 ? '1K' : 1}
                      </Text>
                    </View>
                  </Marker>
                ))
                : null}
            </MapView> : <ActivityIndicator size={'large'} />
          }
          <CustomModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            modalWidth={350}
            modalHeight={200}
            hitData={hitData!}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
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
})