import Obniz from "obniz";
import * as dotenv from "dotenv";
dotenv.config();

const gasUrl = process.env.GAS_URL ?? "";
const obniz = new Obniz(process.env.OBNIZ_ID ?? "");
obniz.onconnect = async function () {
  const LoundnessSensor = obniz.wired("Grove_LightSensor", {
    gnd: 4,
    vcc: 5,
    signal: 7,
  });

  const postLineNotify = async () => {
    const post_url: string = `${gasUrl}?action=postLineNotify`;
    const result = await fetch(post_url, {
      method: "POST",
      body: JSON.stringify({}),
    });
    console.log(result);
  };
  const triggerLoundnessSensor = async () => {
    const loundnessValue = await LoundnessSensor.getWait();
    let loudnessOverValue = 0;
    if (process.env.LOUDNESS_OVER_VALUE != undefined) {
      loudnessOverValue = Number(process.env.LOUDNESS_OVER_VALUE);
    } else {
      loudnessOverValue = 5.0;
    }
    if (
      loundnessValue >= loudnessOverValue
    ) {
      console.log("loundnessValue");
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
