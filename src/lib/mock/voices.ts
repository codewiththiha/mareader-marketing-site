export interface VoiceModel {
	id: string;
	name: string;
	about: string;
	size: string;
	state: "offer" | "downloading" | "ready";
	progress?: number;
	voices?: string;
}
