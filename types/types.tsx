export interface Outages {
  took: number
  timed_out: boolean
  _shards: Shards
  hits: Hits
}

export interface Shards {
  total: number
  successful: number
  skipped: number
  failed: number
}

export interface Hits {
  total: Total
  max_score: any
  hits: Hit[]
}

export interface Total {
  value: number
  relation: string
}

export interface Hit {
  _index: string
  _id: string
  _score: any
  _source: Source
  sort: [number, string]
}

export interface Source {
  incidentId: string
  polygonCenter: number[]
  customerCount: number
  estimatedTimeOfRestoration: string
  reason: string
  status: string
  updateTime: string
}

export interface MapConfig {
  ClusteringEnabled: boolean
  MinimumClusterPoints: number
  ShowPolygonsZoomLevel: number
  DefaultMapZoomLevel: number
  CenterPosition: string
  MessageETR: string
  AlwaysActiveETR: boolean
  OnlyExpired_ETR: boolean
  olddatathreshold: number
  DefaultMapZoomLevel_Mobile: number
  CenterPosition_Mobile: string
  MinimumZoomOut: number
  RestrictionMode: boolean
  mapUnavailableMessage: string
  SurveyComponent: boolean
  manualMode: boolean
  DownLineReportFlag: boolean
  MapView_East: any
  MapView_North: any
  MapView_South: any
  MapView_West: any
  trayUpdateMessage: string
  traySafetyMessage: string
  lastDateTime: string
}

export interface PolygonCoords {
  latitude: number
  longitude: number
}

