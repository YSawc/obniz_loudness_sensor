import Obniz from "obniz";
import * as dotenv from "dotenv";
dotenv.config();

const gasUrl = process.env.GAS_URL ?? "";
const obniz = new Obniz(process.env.OBNIZ_ID ?? "");

const postLineNotify = async () => {
  const lineAapiToken = process.env.LINE_API_TOKEN ?? "";
  const message = "loudness occured";
  const body: URLSearchParams = new URLSearchParams({
    message: message,
  });

  const res = await fetch("https://notify-api.line.me/api/notify", {
    method: "post",
    headers: {
      Authorization: "Bearer " + lineAapiToken,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const json = await res.json();
  console.log("line notify post result:");
  console.log(JSON.stringify(json));
};

obniz.onconnect = async function() {
  const LoundnessSensor = obniz.wired("Grove_LightSensor", {
    gnd: 0,
    vcc: 1,
    signal: 3,
  });

  const triggerLoundnessSensor = async () => {
    const loundnessValue = await LoundnessSensor.getWait();
    let loudnessOverValue: number;
    if (process.env.LOUDNESS_OVER_VALUE != undefined) {
      loudnessOverValue = Number(process.env.LOUDNESS_OVER_VALUE);
    } else {
      loudnessOverValue = 5.0;
    }
    if (
      loundnessValue >= loudnessOverValue
    ) {
      console.log("loundnessValue over");
      console.log(loundnessValue);
      postLineNotify();
    }
  };
  const getData = async (url: string) => {
    fetch(url, {
      method: "GET",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          triggerLoundnessSensor();
        }
      })
      .catch((error) => console.log(error));
  };

  obniz.onloop = async () => {
    await getData(gasUrl);
  };
};
