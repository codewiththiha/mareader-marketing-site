import type { ComponentConstructorOptions, SvelteComponent } from "svelte";
import type { IconProps } from "lucide-svelte";

export type IconComponent = new (options: ComponentConstructorOptions<IconProps>) => SvelteComponent<IconProps>;
