import React from "react";
import { Wheel } from "react-custom-roulette";

const testData = [{ option: "Test 1" }, { option: "Test 2" }];

export const WheelTest: React.FC = () => {
  return (
    <div style={{ padding: "50px" }}>
      <h2>Wheel Test Component</h2>
      <Wheel
        mustStartSpinning={false}
        prizeNumber={0}
        data={testData}
        onStopSpinning={() => console.log("stopped")}
      />
    </div>
  );
};
