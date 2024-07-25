import React, { useEffect, useRef } from "react";

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the Google Maps API
    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=` +
      process.env.REACT_APP_GOOGLE_API_KEY +
      `&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Initialize the map
    script.onload = () => {
      if (mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 56.1304, lng: -106.3468 }, // Canada coordinates
          zoom: 4,
        });

        map.data.loadGeoJson("/data/georef-canada-province@public.geojson");

        map.data.setStyle((feature) => {
          const provinceName = feature.getProperty("prov_name_en")[0];
          let fillColor = "#0000FF"; // Default blue color

          const geo_point = feature.getProperty("geo_point_2d");
          const center = new google.maps.LatLng(geo_point.lat, geo_point.lon);
          let overlay = new CustomOverlay(center, "0%");
          // Assign different shades of blue based on the province name
          console.log("Province Name", provinceName);
          console.log("GeoPoint2d", feature.getProperty("geo_point_2d"));
          switch (provinceName) {
            case "Ontario":
              console.log("Province name match");
              overlay = new CustomOverlay(center, "20%");

              fillColor = "#1E90FF";
              break;
            case "Quebec":
              overlay = new CustomOverlay(center, "15%");

              fillColor = "#4169E1";
              break;
            case "British Columbia":
              overlay = new CustomOverlay(center, "35%");
              fillColor = "#4682B4";
              break;
            // Add more cases for other provinces
            default:
              fillColor = "#87CEFA";
          }

          overlay.setMap(map);

          return {
            fillColor: fillColor,
            fillOpacity: 0.6,
            strokeColor: "#0000FF",
            strokeWeight: 1,
          };
        });

        // Custom Overlay Class
        class CustomOverlay extends google.maps.OverlayView {
          position: google.maps.LatLng;
          text: string;
          div: HTMLDivElement | null;

          constructor(position: google.maps.LatLng, text: string) {
            super();
            this.position = position;
            this.text = text;
            this.div = null;
          }

          onAdd() {
            this.div = document.createElement("div");
            this.div.style.position = "absolute";
            this.div.style.padding = "5px";
            this.div.style.zIndex = "2000";
            this.div.style.fontSize = "2em";

            this.div.innerHTML = this.text;
            const panes = this.getPanes();
            panes.overlayLayer.appendChild(this.div);
          }

          draw() {
            if (this.position) {
              console.log("Draw", this.position);
              const overlayProjection = this.getProjection();
              const position = overlayProjection.fromLatLngToDivPixel(
                this.position
              );
              if (this.div) {
                this.div.style.left = `${position.x}px`;
                this.div.style.top = `${position.y}px`;
              }
            } else {
              console.log("Position is null");
            }
          }

          onRemove() {
            if (this.div) {
              this.div.parentNode?.removeChild(this.div);
              this.div = null;
            }
          }
        }

        // Add the custom overlay to the map
      }
    };

    return () => {
      // Clean up the Google Maps API script
      document.head.removeChild(script);
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default Map;
