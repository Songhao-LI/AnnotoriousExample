"use client";

import "@annotorious/react/annotorious-react.css";
import dynamic from "next/dynamic";
import React, { useState } from "react";
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
  () => import("@annotorious/react").then((mod) => mod.Annotorious),
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

  const switchTool = (selectedTool: any | undefined) => {
    setToolItem(selectedTool);
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
      </div>

      <OpenSeadragonAnnotator
        drawingEnabled={toolItem.tool !== undefined}
        tool={toolItem.tool || "rectangle"}
      >
        <OpenSeadragonViewer
          className="bg-gray-700 w-full h-[calc(100vh-88px)] relative"
          options={{
            prefixUrl: "https://openseadragon.github.io/openseadragon/images/",
            tileSources: {
              height: 512 * 256,
              width: 512 * 256,
              tileSize: 256,
              minLevel: 8,
              getTileUrl: function (level, x, y) {
                return (
                  "http://s3.amazonaws.com/com.modestmaps.bluemarble/" +
                  (level - 8) +
                  "-r" +
                  y +
                  "-c" +
                  x +
                  ".jpg"
                );
              },
            },
          }}
        />
      </OpenSeadragonAnnotator>
      {/* uncomment this to see the error
      <OpenSeadragonAnnotationPopup popup={(props) => <div>Hello World</div>} /> */}
    </Annotorious>
  );
}
