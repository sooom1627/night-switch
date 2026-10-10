import { renderRouter } from "expo-router/testing-library";

import { screen } from "@testing-library/react-native";

describe("S-001 T-002 ST-004 home screen", () => {
  test("shows the app name on launch", async () => {
    await renderRouter("./src/app");

    expect(await screen.findByText("night-switch")).toBeOnTheScreen();
  });
});
