// src/leaflet-geosearch.d.ts
declare module 'leaflet-geosearch' {
    import * as L from 'leaflet';

    export interface GeoSearchControlOptions {
        provider: any;
        style?: 'button' | 'bar';
        showMarker?: boolean;
        showPopup?: boolean;
        marker?: L.MarkerOptions;
        popupFormat?: ({ query, result }: { query: string; result: any }) => string;
        maxMarkers?: number;
        retainZoomLevel?: boolean;
        animateZoom?: boolean;
        autoClose?: boolean;
        searchLabel?: string;
        keepResult?: boolean;
        updateMap?: boolean;
    }

    export class GeoSearchControl extends L.Control {
        constructor(options?: GeoSearchControlOptions);
    }

    export class OpenStreetMapProvider {
        constructor(options?: any);
        search({ query }: { query: string }): Promise<any>;
    }
}
