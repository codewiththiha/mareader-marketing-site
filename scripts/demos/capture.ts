import { mount } from "svelte";
import Capture from "./Capture.svelte";
import "../../src/app.css";
import "../../src/lib/components/Film/Mock/mock.css";

mount(Capture, { target: document.getElementById("capture")! });
