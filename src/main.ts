import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root element");
mount(App, { target: root });
