import { Outlet } from "react-router";
import { BottomBar } from "./BottomBar";

export function Layout() {
  return (
    <>
      <Outlet />
      <BottomBar />
    </>
  );
}
