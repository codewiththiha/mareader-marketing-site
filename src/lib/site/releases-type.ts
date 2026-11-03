/** One GitHub release as embedded at build time. */
export interface ReleaseAsset {
  name: string;
  size: number;
  url: string;
}

export interface Release {
  tag: string;
  name: string;
  published: string;
  body: string;
  assets: ReleaseAsset[];
}
