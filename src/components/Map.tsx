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
          mapTypeControlOptions: { mapTypeIds: [] },
          streetViewControl: false,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "all",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "administrative.province",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "administrative.locality",
              elementType: "labels",
              stylers: [{ visibility: "on" }],
            },
          ],
        });

        map.data.loadGeoJson("/data/georef-canada-province@public.geojson");

        fetch("/data/cities.geojson")
          .then((response) => response.json())
          .then((data) => {
            map.data.addGeoJson(data);
          });

        map.data.setStyle((feature) => {
          if (feature.getProperty("prov_name_en") !== undefined) {
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
          } else {
            // This should add a circle on Toronto
            const cityName = feature.getProperty("name");
            console.log("City name", cityName);
            let fillColor = "#000000"; // Default blue color
            let icon = getCircle(0);
            if (cityName === "Toronto") {
              icon = getCircle(3);
            }
            return {
              fillColor: fillColor,
              fillOpacity: 0.6,
              strokeColor: "#0000FF",
              strokeWeight: 1,
              label: "20%",
              visible: true,
              icon: icon,
            };
          }
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

  function getCircle(magnitude: number): google.maps.Symbol {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: "red",
      fillOpacity: 0.2,
      scale: Math.pow(2, magnitude) / 2,
      strokeColor: "white",
      strokeWeight: 0.5,
    };
  }

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
};

export default Map;
