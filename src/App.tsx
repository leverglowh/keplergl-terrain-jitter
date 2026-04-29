/* eslint-disable @typescript-eslint/no-explicit-any */
import "./App.css";
import { useState, useCallback, useEffect } from "react";
import isPropValid from "@emotion/is-prop-valid";
import { injectComponents } from "@kepler.gl/components";
import { theme } from "@kepler.gl/styles";
import { Panel, PanelGroup } from "react-resizable-panels";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import styled, { StyleSheetManager, ThemeProvider } from "styled-components";

function shouldForwardProp(propName: string, target: any) {
  if (typeof target === "string") {
    // For HTML elements, forward the prop if it is a valid HTML attribute
    return isPropValid(propName);
  }
  // For other elements, forward all props
  return true;
}

const KeplerGl = injectComponents([]);

const GlobalStyle = styled.div`
  font-family: ff-clan-web-pro, "Helvetica Neue", Helvetica, sans-serif;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.71429;

  *,
  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
  }

  a {
    text-decoration: none;
    color: ${(props) => props.theme.labelColor};
  }
`;

const CONTAINER_STYLE: React.CSSProperties = {
  transition: "margin 1s, height 1s",
  position: "absolute",
  width: "100%",
  height: "100%",
  left: 0,
  top: 0,
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#333",
};

const TERRAIN_SOURCE_ID = "terrainSource";
const HILLSHADE_SOURCE_ID = "hillshadeSource";
const TERRAIN_TILE_URL = "https://tiles.mapterhorn.com/tilejson.json";

const ensureStyleLoaded = (map): Promise<void> =>
  map.isStyleLoaded()
    ? Promise.resolve()
    : new Promise((resolve) => map.once("styledata", () => resolve()));

const App = () => {
  const [mapRef, setMapRef] = useState(null);

  const applyTerrain = useCallback(
    async (map) => {
      await ensureStyleLoaded(map);

      if (!map.getSource(TERRAIN_SOURCE_ID)) {
        map.addSource(TERRAIN_SOURCE_ID, {
          type: "raster-dem",
          url: TERRAIN_TILE_URL,
        });
      }

      if (!map.getSource(HILLSHADE_SOURCE_ID)) {
        map.addSource(HILLSHADE_SOURCE_ID, {
          type: "raster-dem",
          url: TERRAIN_TILE_URL,
        });
      }

      if (!map.getLayer("hillshade")) {
        map.addLayer({
          id: "hillshade",
          type: "hillshade",
          source: HILLSHADE_SOURCE_ID,
          layout: { visibility: "visible" },
          paint: {
            "hillshade-shadow-color": "#473B24",
          },
        });
      }

      map.setTerrain({
        source: TERRAIN_SOURCE_ID,
        exaggeration: 1.5,
      });
    },
    [],
  );

  useEffect(() => {
    if (mapRef) {
      applyTerrain(mapRef);
    }
  }, [applyTerrain, mapRef])

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ThemeProvider theme={theme}>
        <GlobalStyle>
          <div style={CONTAINER_STYLE}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={100}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={100}>
                    <AutoSizer>
                      {({ height, width }) => (
                        <KeplerGl
                          mapboxApiAccessToken={
                            import.meta.env.VITE_MapboxAccessToken
                          }
                          id="map"
                          getMapboxRef={map => setMapRef(map?.getMap() || null)}
                          width={width}
                          height={height}
                        />
                      )}
                    </AutoSizer>
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </div>
        </GlobalStyle>
      </ThemeProvider>
    </StyleSheetManager>
  );
};

export default App;
