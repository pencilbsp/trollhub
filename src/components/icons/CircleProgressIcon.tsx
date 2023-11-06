"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function CircleProgressIcon() {
  return (
    <CircularProgressbar
      value={25}
      strokeWidth={10}
    />
  );
}
