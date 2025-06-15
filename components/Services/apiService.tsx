import { CONFIG_API_URL, OUTAGES_API_URL, TOTAL_CUSTOMER_COUNT_URL } from "@/constants/APIs";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "", // Replace with your API base URL                  
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer YOUR_TOKEN' // Optional: Auth header
  }
});


export const GetMapConfig = async () => {
  let res = await axiosInstance.get(CONFIG_API_URL);
  return res?.data;
}

export const GetOutages = async () => {
  let res = await axiosInstance.post(OUTAGES_API_URL, { "size": 10000, "query": { "bool": { "must": { "match_all": {} }, "filter": { "geo_bounding_box": { "polygonCenter": { "top_left": { "lat": 28.70343307240943, "lon": -83.79740182148437 }, "bottom_right": { "lat": 27.003667078761065, "lon": -80.89975777851562 } } } } } }, "sort": [{ "updateTime": "asc" }, { "incidentId": "asc" }], "_source": ["updateTime", "status", "reason", "customerCount", "polygonCenter", "incidentId", "estimatedTimeOfRestoration"] });
  return res?.data;
}

export const GetTotalCustomers = async () => {
  let res = await axiosInstance.post(TOTAL_CUSTOMER_COUNT_URL, {})
  return res?.data
}
