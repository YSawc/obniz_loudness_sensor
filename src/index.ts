import Obniz from "obniz";
import * as dotenv from "dotenv";
dotenv.config();

const obniz = new Obniz(process.env.OBNIZ_ID ?? "");

const postPyumApi = async (loundnessValue: number) => {
  const shiftDigit = 1;
  const sendValue = Math.floor(loundnessValue * (10 ** shiftDigit));
  const body = JSON.stringify({
    "sensor_id": Number(process.env.SENSOR_ID),
    "capture_val": sendValue,
    "shift_digit": shiftDigit,
  });
  const res = await fetch(`${process.env.PYUM_URL}/api/capture`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Client-Secret": `${process.env.PYUM_OAUTH}`,
    },
    body,
  });
  if (!res.ok) {
    console.log("In postirng pyum api, error occured.");
  }
};

obniz.onconnect = async function () {
  const LoundnessSensor = obniz.wired("Grove_LightSensor", {
    gnd: 0,
    vcc: 1,
    signal: 3,
  });

  const triggerLoundnessSensor = async () => {
    const loundnessValue = await LoundnessSensor.getWait();
    await postPyumApi(loundnessValue);
  };

  obniz.onloop = async () => {
    triggerLoundnessSensor();
  };
};
