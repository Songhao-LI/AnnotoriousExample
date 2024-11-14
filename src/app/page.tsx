"use client";

import "@annotorious/react/annotorious-react.css";
import dynamic from "next/dynamic";
import React, {useEffect, useState} from "react";
import { FiMove } from "react-icons/fi";
import { LiaDrawPolygonSolid } from "react-icons/lia";
import { PiRectangle } from "react-icons/pi";
import { LuRuler, LuUndo } from "react-icons/lu";
import { IoFilter } from "react-icons/io5";

/*
Once installed, open the package.json file located in the node_modules/@annotorious/react directory,
and add the require field to the exports section, as shown below:
"exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/annotorious-react.es.js",
      "require": "./dist/annotorious-react.es.js"
    },
    "./annotorious-react.css": "./dist/annotorious-react.css"
  },
*/

const Annotorious = dynamic(
  () => import("@annotorious/react")
      .then((mod) => {
                console.log(mod);
                return mod.Annotorious
      }),
  { ssr: false }
);

const OpenSeadragonAnnotator = dynamic(
  () => import("@annotorious/react").then((mod) => mod.OpenSeadragonAnnotator),
  { ssr: false }
);
const OpenSeadragonAnnotationPopup = dynamic(
  () =>
    import("@annotorious/react").then(
      (mod) => mod.OpenSeadragonAnnotationPopup
    ),
  { ssr: false }
);
const OpenSeadragonViewer = dynamic(
  () => import("@annotorious/react").then((mod) => mod.OpenSeadragonViewer),
  { ssr: false }
);

import {useAnnotator} from '@annotorious/react';

function AnnotatorInstanceSetter({ setAnnotatorInstance }: any) {
  const annotatorInstance = useAnnotator<any>();

  useEffect(() => {
    if (annotatorInstance) {
      setAnnotatorInstance(annotatorInstance);
    }
  }, [annotatorInstance]);

  return null;
}

export default function App() {
  // toolkit
  const [hoveredTool, setHoveredTool] = useState<string | undefined | null>(
    null
  );
  const toolkitItems = [
    {
      name: "Move",
      tool: undefined,
      icon: <FiMove size={22} strokeWidth={1.5} />,
    },
    {
      name: "Polygon",
      tool: "polygon",
      icon: <LiaDrawPolygonSolid size={24} />,
    },
    { name: "Rectangle", tool: "rectangle", icon: <PiRectangle size={22} /> },
    { name: "Ruler", tool: "undefined", icon: <LuRuler size={22} /> },
    { name: "Undo", tool: undefined, icon: <LuUndo size={22} /> },
    { name: "Filter", tool: undefined, icon: <IoFilter size={22} /> },
  ];
  const [toolItem, setToolItem] = useState<any>(toolkitItems[0]);

  const [annotatorInstance, setAnnotatorInstance] = useState<any>(null);

  const switchTool = (selectedTool: any | undefined) => {
    setToolItem(selectedTool);
  };

  let level_0_width = 50000
  let level_0_height = 50000
  let levelCount = 0
  let scale = 16;
  const maxLevel = 8;
  const svs_width = level_0_width * scale;
  const svs_height = level_0_height * scale;
  const tile_size = 512;
  const newTileSource = {
    width: svs_width,
    height: svs_height,
    tileSize: tile_size,
    tileOverlap: 0,
    minLevel: 0,
    maxLevel: maxLevel,
    getTileUrl: function (level: number, x: number, y: number): string {
      return `http://127.0.0.1:5000/api/loader/slide/${level}/${x}_${y}.jpeg`;
    }
  };
  const options = {
    id: "viewer",
    prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
    navigatorSizeRatio: 0.25,
    wrapHorizontal: false,
    showNavigator: true,
    showRotationControl: true,
    showZoomControl: true,
    tileSources: newTileSource,
    gestureSettingsMouse: {
      flickEnabled: true,
      clickToZoom: false,
      dblClickToZoom: false
    },
    rotationIncrement: 30,
    gestureSettingsTouch: {
      pinchRotate: true
    },
    animationTime: 0,
    springStiffness: 100,
    zoomPerSecond: 1,
    zoomPerScroll: 1.5,
    loadTilesWithAjax: true,
    timeout: 1000000,
  }

  const loadAnnotations = async () => {
    try {
      if (!annotatorInstance) {
        console.error("Annotator not initialized");
        return;
      }
      console.log("annotationInstance: ", annotatorInstance);
      const response = await fetch("/api/annotations");
      console.log("response: ", response);
      const data = await response.json();
        console.log("data: ", data);
      annotatorInstance.setAnnotations(data.annotations);
    } catch (error) {
      console.error("Error loading annotations:", error);
    }
  };


  return (
    <Annotorious>
      <div
        className="flex gap-2 px-2 py-1"
        style={{ width: "100%", height: "40px", position: "relative" }}
      >
        {toolkitItems.map((item) => (
          <div key={item.tool} className="relative inline-block">
            <button
              onClick={() => switchTool(item)}
              onMouseEnter={() => setHoveredTool(item.name)}
              onMouseLeave={() => setHoveredTool(null)}
              className={`text-gray-800 hover:text-blue-600 flex items-center px-1 py-1 rounded-md ${
                toolItem.name === item.name ? "bg-gray-300" : ""
              }`}
            >
              {item.icon}
            </button>
            {hoveredTool === item.name && (
              <div
                className="absolute left-0 mt-2 w-40 z-10 rounded-md shadow-lg bg-gray-100/80 backdrop-blur-md ring-1 ring-black ring-opacity-5"
                onMouseEnter={() => setHoveredTool(item.name)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className="py-1">
                  <div className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-200/80 hover:text-gray-900">
                    {item.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <button
          onClick={loadAnnotations}
          className="text-gray-800 hover:text-blue-600 flex items-center px-2 py-1 rounded-md"
        >
          Load Data
        </button>
      </div>

      <OpenSeadragonAnnotator
        drawingEnabled={toolItem.tool !== undefined}
        tool={toolItem.tool || "rectangle"}
      >
        <AnnotatorInstanceSetter setAnnotatorInstance={setAnnotatorInstance} />
        <OpenSeadragonViewer
          className="bg-gray-700 w-full h-[calc(100vh-88px)] relative"
          options={options}
        />
      </OpenSeadragonAnnotator>
    </Annotorious>
  );
}