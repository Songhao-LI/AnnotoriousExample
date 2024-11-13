import {useEffect, useRef, useState, useCallback} from 'react';
import OpenSeadragon from "openseadragon";
import {useSelector} from "react-redux";
import {RootState} from "@/store";
import { throttle } from 'lodash';

const useOpenSeadragonViewerEvents = (viewerRef: any, annotatorInstance: any, socket: WebSocket | null, status: any) => {
  const thresholdData = useSelector((state: RootState) => state.annotations.threshold)
  const thresholdDataRef = useRef(thresholdData)

  // Create a stable throttled function
  const sendCoordinates = useCallback(
    throttle((coordinates: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const message = JSON.stringify(coordinates);
        console.log("Sending coordinates to server:", message);
        socket.send(message);
      } else {
        console.warn("WebSocket is not open.");
      }
    }, 1000, { trailing: false }),
    [socket]
  );

  useEffect(() => {
    thresholdDataRef.current = thresholdData
  }, [thresholdData])

  useEffect(() => {
      if (viewerRef.current) {
        const getVisibleImageCoordinates = (viewer: any) => {
            const viewportBounds = viewer.viewport.getBounds();
            const topLeft = viewer.viewport.viewportToImageCoordinates(viewportBounds.getTopLeft());
            const bottomRight = viewer.viewport.viewportToImageCoordinates(viewportBounds.getBottomRight());
            // Get the viewer element's bounding rectangle
            const viewerElement = viewer.element;
            const viewerRect = viewerElement.getBoundingClientRect();
            // Get the device pixel ratio (for HiDPI screens)
            const dpr = 1;
            // Get the screen coordinates of the viewer
            const screenX = Math.round((window.screenLeft + viewerRect.left) * dpr);
            const screenY = Math.round((window.screenTop + viewerRect.top) * dpr);
            const scale = 16;
            // console.log(window.screenLeft, window.screenTop, viewerRect.left, viewerRect.top);

            return {
                image: {
                    x1: Math.round(topLeft.x/scale),
                    y1: Math.round(topLeft.y/scale),
                    x2: Math.round(bottomRight.x/scale),
                    y2: Math.round(bottomRight.y/scale)
                },
                screen: {
                    x: screenX,
                    y: screenY,
                    width: Math.round(viewerRect.width * dpr),
                    height: Math.round(viewerRect.height * dpr)
                },
                dpr: dpr
            };
        };
        // @ts-ignore
        viewerRef.current.addHandler('update-viewport', function() {
            if (viewerRef.current) {
              const coordinates = getVisibleImageCoordinates(viewerRef.current);
              const dataPoint = {
                  timestamp: new Date().toISOString(),
                  coordinates: coordinates
              };

              // send to websocket channel
              const zoom = viewerRef.current.viewport.getZoom();
              const maxZoom = viewerRef.current.viewport.getMaxZoom();
              const minZoom = viewerRef.current.viewport.getMinZoom();

              // Assuming 0 to 8 levels, calculate the current level
              const maxLevel = 8;
              const level = Math.round(((zoom - minZoom) / (maxZoom - minZoom)) * maxLevel);

              if (level >= thresholdDataRef.current) {
                const { x1, y1, x2, y2 } = coordinates.image;
                sendCoordinates({ x1, y1, x2, y2 });
              }

              if (window.electron) {
                  window.electron.send('save-coordinates', dataPoint);
              } else {
                  console.warn('Electron IPC not available. Unable to send coordinates to main process.');
              }
            }
        })
        // @ts-ignore
        viewerRef.current.addHandler('canvas-enter', function(event) {
            if (viewerRef.current) {
                var webPoint = event.position;
                // @ts-ignore
                var viewportPoint = viewerRef.current.viewport.pointFromPixel(webPoint);
                // @ts-ignore
                var imagePoint = viewerRef.current.viewport.viewportToImageCoordinates(viewportPoint);
            }
        })
        const timer = setInterval(() => {
            if (viewerRef.current && viewerRef.current.container) {
                new OpenSeadragon.MouseTracker({
                    element: viewerRef.current.container,
                    // @ts-ignore
                    moveHandler: function(event: { position: any }) {
                        if (viewerRef.current) {
                            const webPoint = event.position;
                            const viewportPoint = viewerRef.current.viewport.pointFromPixel(webPoint);
                            const imagePoint = viewerRef.current.viewport.viewportToImageCoordinates(viewportPoint);
                        }
                    }
                });
                clearInterval(timer);
            }
        }, 100);

        return () => {
          clearInterval(timer)
        };
      }
    }, [viewerRef.current, status, socket, sendCoordinates]);

}

export default useOpenSeadragonViewerEvents;
